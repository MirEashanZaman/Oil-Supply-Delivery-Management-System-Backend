import { Injectable, NotFoundException, BadRequestException, HttpException, HttpStatus } from "@nestjs/common";
import { CustomerDTO } from "./customer.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { CustomerEntity } from './customer.entity';
import { Like, Repository, DeepPartial } from "typeorm";
import { OrderEntity } from '../order/order.entity';
import { Product } from '../product/product.entity';
import { OrderDetailsEntity } from '../order/order-details.entity';
import { PaymentEntity } from '../payment/payment.entity';
import { DeliveryEntity } from '../delivery/delivery.entity';
import { Dealer } from '../dealer/dealer.entity';
import { SupplierEntity } from '../supplier/supplier.entity';
import { MailerService } from '@nestjs-modules/mailer';
import * as bcrypt from 'bcrypt';
import { OrderSubject, EmailNotificationObserver, AuditLogObserver, RealtimeDispatchObserver } from '../patterns/observer/order-observer';
import { OrderFulfillmentSagaOrchestrator, SagaContext, SagaStep } from '../patterns/saga/order-saga';
import { PaymentStrategyResolver } from '../patterns/strategy/payment-strategy';

@Injectable()
export class CustomerService {
    private orderSubject: OrderSubject;
    private paymentStrategyResolver: PaymentStrategyResolver;

    constructor(
        @InjectRepository(CustomerEntity) private customerRepository: Repository<CustomerEntity>,
        @InjectRepository(OrderEntity) private orderRepository: Repository<OrderEntity>,
        @InjectRepository(Product) private productRepository: Repository<Product>,
        @InjectRepository(OrderDetailsEntity) private orderDetailsRepository: Repository<OrderDetailsEntity>,
        @InjectRepository(PaymentEntity) private paymentRepository: Repository<PaymentEntity>,
        @InjectRepository(DeliveryEntity) private deliveryRepository: Repository<DeliveryEntity>,
        @InjectRepository(Dealer) private dealerRepository: Repository<Dealer>,
        @InjectRepository(SupplierEntity) private supplierRepository: Repository<SupplierEntity>,
        private mailerService: MailerService,
    ) {
        this.orderSubject = new OrderSubject();
        this.orderSubject.attach(new EmailNotificationObserver());
        this.orderSubject.attach(new AuditLogObserver());
        this.orderSubject.attach(new RealtimeDispatchObserver());
        this.paymentStrategyResolver = new PaymentStrategyResolver();
    }

    async sendEmail(to: string, subject: string, text: string) {
        return await this.mailerService.sendMail({
            to: to,
            subject: subject,
            text: text,
        });
    }

    getCustomer(): string {
        return "Eashan";
    }

    async getAllCustomer(): Promise<CustomerEntity[]> {
        return this.customerRepository.find({
            relations: {
                orders: {
                    product: true,
                    supplier: true,
                    dealer: true,
                },
            },
        });
    }

    async getCustomerByID(id: number): Promise<CustomerEntity | null> {
        return this.customerRepository.findOneBy({ id });
    }

    getCustomerByIDandName(id: number, name: string): object {
        return { name: name, id: id }
    }

    async createCustomer(customerData: CustomerDTO): Promise<CustomerEntity> {
        const existing = await this.customerRepository.findOneBy({ email: customerData.email as string });
        if (existing) {
            throw new HttpException('Customer already exists', HttpStatus.CONFLICT);
        }

        const isHashed = customerData.password && /^\$2[aby]\$\d{2}\$/.test(customerData.password);
        const hashedPassword = customerData.password
            ? (isHashed ? customerData.password : await bcrypt.hash(customerData.password, 10))
            : undefined;

        const customer = this.customerRepository.create({
            ...customerData,
            password: hashedPassword,
        });
        return this.customerRepository.save(customer);
    }

    updateCustomer(id: number, updateCustomer: CustomerDTO): CustomerDTO {
        console.log('update customer id', id);
        return updateCustomer;
    }

    async createOrder(customerId: string, order: OrderEntity): Promise<any> {
        const customer = await this.customerRepository.findOneBy({ id: Number(customerId) });
        if (!customer) {
            throw new NotFoundException('Customer not found');
        }

        let product: Product | null = null;
        if (order.product && order.product.id) {
            product = await this.productRepository.findOneBy({ id: order.product.id });
            if (!product || !product.quantity || product.quantity <= 0) {
                throw new BadRequestException('Low stock');
            }
            const requestedQty = order.quantity || 1;
            if (product.quantity < requestedQty) {
                throw new BadRequestException('Low stock');
            }
            product.quantity = product.quantity - requestedQty;
            await this.productRepository.save(product);
        }

        let dealer: Dealer | null = null;
        if (order.dealer && order.dealer.id) {
            dealer = await this.dealerRepository.findOneBy({ id: order.dealer.id });
        }

        let supplier: SupplierEntity | null = null;
        if (order.supplier && order.supplier.id) {
            supplier = await this.supplierRepository.findOneBy({ id: order.supplier.id });
        }

        const resolvedSupplierId = supplier?.id ?? (order.supplierId ? Number(order.supplierId) : null);
        const resolvedDealerId = dealer?.id ?? (order.dealerId ? Number(order.dealerId) : null);

        const newOrder = this.orderRepository.create({
            ...order,
            sourceType: order.sourceType || (resolvedSupplierId ? 'supplier' : resolvedDealerId ? 'dealer' : 'customer'),
            supplierId: resolvedSupplierId || undefined,
            dealerId: resolvedDealerId || undefined,
            customer: customer,
            dealer: dealer || undefined,
            supplier: supplier || undefined,
        } as DeepPartial<OrderEntity>);
        const savedOrder = await this.orderRepository.save(newOrder);

        // Execute SAGA Orchestration Steps (Inventory Allocation -> Order Record -> Payment Strategy -> Delivery Depot Dispatch)
        const saga = new OrderFulfillmentSagaOrchestrator();

        // Step 1: Payment Processing via Strategy Pattern
        saga.addStep({
            stepName: 'ProcessPaymentStrategyStep',
            execute: async (ctx: SagaContext) => {
                const strategy = this.paymentStrategyResolver.resolve(ctx.paymentMethod);
                const paymentResult = await strategy.pay(ctx.totalAmount, {
                    paymentMethod: ctx.paymentMethod,
                    cardType: ctx.cardType,
                    paymentReference: ctx.paymentReference,
                });
                const payment = this.paymentRepository.create({
                    amount: ctx.totalAmount,
                    cardType: ctx.cardType,
                    paymentMethod: strategy.name,
                    paymentReference: ctx.paymentReference || paymentResult.transactionId,
                    status: paymentResult.gatewayStatus || 'completed',
                });
                const savedPayment = await this.paymentRepository.save(payment);
                ctx.paymentId = savedPayment.id;
            },
            compensate: async (ctx: SagaContext) => {
                if (ctx.paymentId) {
                    await this.paymentRepository.update(ctx.paymentId, { status: 'refunded' });
                }
            },
        });

        const submittedPayment = (order as any).payment as DeepPartial<PaymentEntity> | undefined;
        const sagaContext: SagaContext = {
            customerId: customer.id as number,
            productId: product ? (product.id as number) : 0,
            quantity: order.quantity || 1,
            unitPrice: product ? Number(product.price) || 0 : 0,
            totalAmount: Number(submittedPayment?.amount) || (product ? Number(product.price) * (order.quantity || 1) : 0),
            deliveryAddress: customer.address || 'Default Address',
            paymentMethod: submittedPayment?.paymentMethod || 'card',
            cardType: submittedPayment?.cardType,
            paymentReference: submittedPayment?.paymentReference,
            status: 'PENDING',
        };

        try {
            await saga.execute(sagaContext);
        } catch (sagaErr) {
            // Restore inventory on transaction failure (SAGA compensation)
            if (product && order.quantity) {
                product.quantity = (product.quantity || 0) + (order.quantity || 1);
                await this.productRepository.save(product);
            }
            throw sagaErr;
        }

        const resolvedPaymentId = sagaContext.paymentId;
        const savedPayment = resolvedPaymentId ? await this.paymentRepository.findOneBy({ id: resolvedPaymentId }) : null;

        const submittedDiscount = Number((order as any).discount) || 0;

        const orderDetails = this.orderDetailsRepository.create({
            quantity: order.quantity || 1,
            unitPrice: product ? product.price : 0,
            order: savedOrder,
            product: product || undefined,
            payment: savedPayment || undefined,
            discount: submittedDiscount
        } as DeepPartial<OrderDetailsEntity>);
        const savedOrderDetails = await this.orderDetailsRepository.save(orderDetails);

        const delivery = this.deliveryRepository.create({
            address: customer.address || 'Default Address',
            deliveryStatus: 'pending',
            orderDetails: savedOrderDetails
        } as DeepPartial<DeliveryEntity>);
        await this.deliveryRepository.save(delivery);

        // Notify Observers about order creation (Email Notification, Audit Logging, Realtime Logistics)
        await this.orderSubject.notify('CREATED', {
            orderId: savedOrder.id as number,
            productName: product?.name || 'Petroleum Product',
            quantity: savedOrder.quantity || 1,
            totalAmount: sagaContext.totalAmount,
            status: savedOrder.status || 'pending',
            customerEmail: customer.email,
            timestamp: new Date(),
        });

        return savedOrder;
    }
    async getOrdersByCustomerId(customerId: string): Promise<OrderEntity[]> {
        return this.orderRepository.find({
            where: { customer: { id: Number(customerId) } },
            relations: {
                product: true,
                supplier: true,
                dealer: true,
            },
        });
    }

    async deleteOrder(customerId: string, orderId: string): Promise<{ message: string }> {
        const order = await this.orderRepository.findOne({ where: { id: Number(orderId) }, relations: { customer: true } });
        if (!order) {
            throw new NotFoundException('Order not found');
        }
        if (!order.customer || order.customer.id !== Number(customerId)) {
            throw new BadRequestException('Order does not belong to customer');
        }
        await this.orderRepository.delete(order.id as any);

        await this.orderSubject.notify('CANCELLED', {
            orderId: Number(orderId),
            productName: 'Order Item',
            quantity: order.quantity || 1,
            totalAmount: 0,
            status: 'cancelled',
            customerEmail: order.customer.email,
            timestamp: new Date(),
        });

        return { message: 'Order deleted' };
    }

    async findByUserNameSubstring(userName: string): Promise<CustomerEntity[]> {
        return this.customerRepository.find({
            where: { username: Like(`%${userName}%`) },
        });
    }

    async trackOrderStatus(orderId: number) {
        const order = await this.orderRepository.findOneBy({ id: orderId });
        if (!order) {
            throw new NotFoundException('Order not found');
        }
        return { orderId: orderId, status: "Processing", order: order };
    }

    async confirmOrder(orderId: number, status: string = 'delivered') {
        const order = await this.orderRepository.findOne({ where: { id: orderId }, relations: { customer: true, product: true } });
        if (!order) throw new NotFoundException('Order not found');

        const nextStatus = status.toLowerCase();
        order.status = nextStatus;
        await this.orderRepository.save(order);

        const delivery = await this.deliveryRepository.findOne({
            where: { orderDetails: { order: { id: orderId } } }
        });
        if (delivery) {
            delivery.deliveryStatus = nextStatus === 'delivered' ? 'delivered' : 'processing';
            await this.deliveryRepository.save(delivery);
        }

        // Notify Observers about order fulfillment status change
        await this.orderSubject.notify(nextStatus === 'delivered' ? 'DELIVERED' : 'CONFIRMED', {
            orderId: order.id as number,
            productName: order.product?.name || 'Petroleum Product',
            quantity: order.quantity || 1,
            totalAmount: 0,
            status: nextStatus,
            customerEmail: order.customer?.email,
            timestamp: new Date(),
        });

        return { order, delivery, message: `Order status updated to ${nextStatus} by customer` };
    }

    async findByUsername(username: string): Promise<CustomerEntity | null> {
        return this.customerRepository.findOneBy({ username });
    }

    async findByEmail(email: string): Promise<CustomerEntity | null> {
        return this.customerRepository.findOneBy({ email });
    }

    async deleteByUsername(username: string): Promise<void> {
        await this.customerRepository.delete({ username });
    }

    async patchCustomer(id: number, data: Partial<CustomerDTO> & { username?: string }): Promise<CustomerEntity | null> {
        const updateData: any = { ...data };
        if (updateData.userName && !updateData.username) {
            updateData.username = updateData.userName;
        }
        delete updateData.userName;
        if (updateData.password) {
            const isHashed = /^\$2[aby]\$\d{2}\$/.test(updateData.password);
            if (!isHashed) {
                updateData.password = await bcrypt.hash(updateData.password, 10);
            }
        }
        await this.customerRepository.update(id, updateData);
        return this.customerRepository.findOneBy({ id });
    }
}
