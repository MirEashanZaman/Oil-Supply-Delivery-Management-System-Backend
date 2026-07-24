import { Injectable } from "@nestjs/common";
import { CustomerDTO } from "./customer.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { CustomerEntity } from './customer.entity';
import { Like, Repository } from "typeorm";
import { OrderEntity } from '../order/order.entity';



import { Product } from '../product/product.entity';

@Injectable()
export class CustomerService {
    constructor(
        @InjectRepository(CustomerEntity) private customerRepository: Repository<CustomerEntity>,
        @InjectRepository(OrderEntity) private orderRepository: Repository<OrderEntity>,
        @InjectRepository(Product) private productRepository: Repository<Product>,
    ) { }
    getCustomer(): string {
        return "Eashan";
    }

    async getAllCustomer(): Promise<CustomerEntity[]> {
        return this.customerRepository.find({ relations: { orders: true } 
        });
    }

    async getCustomerByID(id: number): Promise<CustomerEntity | null> {
        return this.customerRepository.findOneBy({ id });
    }

    getCustomerByIDandName(id: number, name: string): object {
        return { name: name, id: id }
    }

    createCustomer(customerData: CustomerDTO): Promise<CustomerEntity> {
        const customer = this.customerRepository.create(customerData);
        return this.customerRepository.save(customer);
    }

    updateCustomer(id: number, updateCustomer: CustomerDTO): CustomerDTO {
        console.log('update customer id', id);
        return updateCustomer;
    }

    async createOrder(customerId: string, order: OrderEntity): Promise<any> {
        const customer = await this.customerRepository.findOneBy({ id: Number(customerId) });
        if (!customer) {
            throw new Error('Customer not found');
        }

        if (order.product && order.product.id) {
            const product = await this.productRepository.findOneBy({ id: order.product.id });
            if (!product || !product.quantity || product.quantity <= 0) {
                return { message: "Low stock" };
            }
            const requestedQty = order.quantity || 1;
            if (product.quantity < requestedQty) {
                return { message: "Low stock" };
            }
            product.quantity = product.quantity - requestedQty;
            await this.productRepository.save(product);
        }

        (order as any).customer = customer;
        return this.orderRepository.save(order);
    }
    async getOrdersByCustomerId(customerId: string): Promise<OrderEntity[]> {
        return this.orderRepository.find({ where: { customer: { id: Number(customerId) } } });
    }

    async findByFullNameSubstring(fullName: string): Promise<CustomerEntity[]> {
        return this.customerRepository.find({
            where: { fullName: Like(`%${fullName}%`) },
        });
    }

    async trackOrderStatus(orderId: number) {
        const order = await this.orderRepository.findOneBy({ id: orderId });
        if (!order) {
            return { message: "Order not found" };
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

}

