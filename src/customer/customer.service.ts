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
import { GeoProximityService, PartnerLocation } from '../patterns/geo/geo-proximity.service';

import { OrderFulfillmentFacade } from '../patterns/facade/order-fulfillment.facade';

@Injectable()
export class CustomerService {
    private orderSubject: OrderSubject;
    private paymentStrategyResolver: PaymentStrategyResolver;
    private orderFacade: OrderFulfillmentFacade;

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
        this.orderFacade = new OrderFulfillmentFacade(
            this.customerRepository,
            this.productRepository,
            this.dealerRepository,
            this.supplierRepository,
            this.orderRepository,
            this.orderDetailsRepository,
            this.paymentRepository,
            this.deliveryRepository,
            this.paymentStrategyResolver,
            this.orderSubject,
        );
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
        const submittedPayment = (order as any).payment as DeepPartial<PaymentEntity> | undefined;
        if (submittedPayment?.cardNumber) {
            throw new BadRequestException('Raw card numbers must not be sent to the API. Use a payment token.');
        }

        const resolvedSupplierId = order.supplier?.id ?? (order.supplierId ? Number(order.supplierId) : undefined);
        const resolvedDealerId = order.dealer?.id ?? (order.dealerId ? Number(order.dealerId) : undefined);

        return this.orderFacade.placeOrder({
            customerId: Number(customerId),
            productId: order.product?.id,
            dealerId: resolvedDealerId,
            supplierId: resolvedSupplierId,
            quantity: order.quantity || 1,
            amount: submittedPayment?.amount,
            paymentMethod: submittedPayment?.paymentMethod || 'card',
            cardType: submittedPayment?.cardType,
            paymentReference: submittedPayment?.paymentReference,
            discount: Number((order as any).discount) || 0,
            deliveryAddress: (order as any).deliveryAddress || (order as any).address,
            sourceType: order.sourceType,
        });
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

    async findNearbySuppliersAndDealers(address?: string, radiusKm: number = 50) {
        const customerCoords = GeoProximityService.geocodeAddress(address);

        const [suppliers, dealers] = await Promise.all([
            this.supplierRepository.find(),
            this.dealerRepository.find(),
        ]);

        const partnerLocations: PartnerLocation[] = [
            ...suppliers.map((s) => ({
                id: s.id,
                name: s.userName || s.name || `Supplier #${s.id}`,
                role: 'Supplier' as const,
                email: s.email,
                phone: s.phoneNumber || s.phone,
                address: s.address || 'Central Petroleum Terminal',
                coordinates: GeoProximityService.geocodeAddress(s.address || s.name),
            })),
            ...dealers.map((d) => ({
                id: d.id,
                name: d.userName || d.name || `Dealer #${d.id}`,
                role: 'Dealer' as const,
                email: d.email,
                phone: d.phoneNumber || d.phone,
                address: d.address || 'Regional Fuel Depot',
                coordinates: GeoProximityService.geocodeAddress(d.address || d.name),
            })),
        ];

        const nearby = GeoProximityService.findNearbyPartners(customerCoords, partnerLocations, radiusKm);

        return {
            customerLocation: {
                address: address || 'Current Customer Location',
                coordinates: customerCoords,
            },
            radiusKm,
            totalFound: nearby.length,
            nearbyPartners: nearby,
        };
    }
}
