import { Injectable } from "@nestjs/common";
import { CustomerDTO } from "./customer.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { CustomerEntity } from './customer.entity';
import { ILike, Repository } from "typeorm";
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

    async getCustomerByID(id: string): Promise<CustomerEntity | null> {
        return this.customerRepository.findOneBy({ id });
    }

    getCustomerByIDandName(id: string, name: string): object {
        return { name: name, id: id }
    }

    createCustomer(customerData: CustomerDTO): Promise<CustomerEntity> {
        const customer = this.customerRepository.create(customerData);
        return this.customerRepository.save(customer);
    }

    updateCustomer(id: string, updateCustomer: CustomerDTO): CustomerDTO {
        console.log('update customer id', id);
        return updateCustomer;
    }

    async createOrder(customerId: string, order: OrderEntity): Promise<OrderEntity> {
        const customer = await this.customerRepository.findOneBy({ id: customerId });
        if (!customer) {
            throw new Error('Customer not found');
        } else {
            (order as any).customer = customer;
            return this.orderRepository.save(order);
        }
    }
    async getOrdersByCustomerId(customerId: string): Promise<OrderEntity[]> {
        return this.orderRepository.find({ where: { customer: { id: customerId } } });
    }

    async findByFullNameSubstring(fullName: string): Promise<CustomerEntity[]> {
        return this.customerRepository.find({
            where: { fullName: ILike(`%${fullName}%`) },
        });
    }

    async findByUsername(username: string): Promise<CustomerEntity | null> {
        return this.customerRepository.findOneBy({ username });
    }

    async deleteByUsername(username: string): Promise<void> {
        await this.customerRepository.delete({ username });
    }

}
