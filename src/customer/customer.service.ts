import { Injectable } from "@nestjs/common";
import { CustomerDTO } from "./customer.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { CustomerEntity } from './customer.entity';
import { Repository } from "typeorm";
import { OrderEntity } from '../order/order.entity';



@Injectable()
export class CustomerService {
    constructor(
        @InjectRepository(CustomerEntity) private customerRepository: Repository<CustomerEntity>,
        @InjectRepository(OrderEntity) private orderRepository: Repository<OrderEntity>,
    ) { }
    getCustomer(): string {
        return "Customer";
    }

    async getAllCustomer(): Promise<CustomerEntity[]> {
        return this.customerRepository.find({ relations: { orders: true } });
    }

    async getCustomerByID(id: number): Promise<CustomerEntity | null> {
        return this.customerRepository.findOneBy({ id: id });
    }

    getCustomerByIDandName(id: number, name: string): object {
        return { name: name, id: id }
    }

    createCustomer(customerData: CustomerDTO): Promise<CustomerEntity> {
        return this.customerRepository.save(customerData as any);
    }

    updateCustomer(id: number, updateCustomer: CustomerDTO): CustomerDTO {
        return updateCustomer;
    }

    async createOrder(customerId: number, order: OrderEntity): Promise<OrderEntity> {
        const customer = await this.customerRepository.findOneBy({ id: customerId });
        if (!customer) {
            throw new Error('Customer not found');
        } else {
            (order as any).customer = customer;
            return this.orderRepository.save(order);
        }
    }
    async getOrdersByCustomerId(customerId: number): Promise<OrderEntity[]> {
        return this.orderRepository.find({ where: { customer: { id: customerId } } });
    }

}
