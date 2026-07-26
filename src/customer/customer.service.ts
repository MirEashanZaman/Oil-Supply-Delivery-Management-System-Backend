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
import { MailerService } from '@nestjs-modules/mailer';
import * as bcrypt from 'bcrypt';

@Injectable()
export class CustomerService {
    constructor(
        @InjectRepository(CustomerEntity) private customerRepository: Repository<CustomerEntity>,
        @InjectRepository(OrderEntity) private orderRepository: Repository<OrderEntity>,
        @InjectRepository(Product) private productRepository: Repository<Product>,
        @InjectRepository(OrderDetailsEntity) private orderDetailsRepository: Repository<OrderDetailsEntity>,
        @InjectRepository(PaymentEntity) private paymentRepository: Repository<PaymentEntity>,
        @InjectRepository(DeliveryEntity) private deliveryRepository: Repository<DeliveryEntity>,
        private mailerService: MailerService,
    ) { }

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
        return this.customerRepository.find({ relations: { orders: true } });
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

        const newOrder = this.orderRepository.create({
            ...order,
            customer: customer
        } as DeepPartial<OrderEntity>);
        const savedOrder = await this.orderRepository.save(newOrder);

        const payment = this.paymentRepository.create(
            ((order as any).payment as DeepPartial<PaymentEntity>) || { status: 'pending' }
        );
        const savedPayment = await this.paymentRepository.save(payment);

        const orderDetails = this.orderDetailsRepository.create({
            quantity: order.quantity || 1,
            unitPrice: product ? product.price : 0,
            order: savedOrder,
            product: product || undefined,
            payment: savedPayment,
            discount: 0
        } as DeepPartial<OrderDetailsEntity>);
        const savedOrderDetails = await this.orderDetailsRepository.save(orderDetails);

        const delivery = this.deliveryRepository.create({
            address: customer.address || 'Default Address',
            deliveryStatus: 'pending',
            orderDetails: savedOrderDetails
        } as DeepPartial<DeliveryEntity>);
        await this.deliveryRepository.save(delivery);

        return savedOrder;
    }
    async getOrdersByCustomerId(customerId: string): Promise<OrderEntity[]> {
        return this.orderRepository.find({ where: { customer: { id: Number(customerId) } } });
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

    async findByUsername(username: string): Promise<CustomerEntity | null> {
        return this.customerRepository.findOneBy({ username });
    }

    async findByEmail(email: string): Promise<CustomerEntity | null> {
        return this.customerRepository.findOneBy({ email });
    }

    async deleteByUsername(username: string): Promise<void> {
        await this.customerRepository.delete({ username });
    }

    async patchCustomer(id: number, data: Partial<CustomerDTO>): Promise<CustomerEntity | null> {
        await this.customerRepository.update(id, data as any);
        return this.customerRepository.findOneBy({ id });
    }
}
