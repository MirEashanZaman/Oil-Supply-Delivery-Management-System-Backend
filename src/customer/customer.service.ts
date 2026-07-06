import { Injectable } from "@nestjs/common";
import { CustomerDTO } from "./customer.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { CustomerEntity } from './customer.entity'; // change this to your entity class
import { Repository } from "typeorm";


@Injectable()
export class CustomerService {
    constructor(@InjectRepository(CustomerEntity) private customerRepository: Repository<CustomerEntity>) { }
    getCustomer(): string {
        return "Customer";
    }

    getAllCustomer(): object {
        return this.customerRepository.find();
    }

    getCustomerByID(id: number, name: string): object {
        return this.customerRepository.findOneBy({ id: id });
    }

    getCustomerByIDandName(id: number, name: string): object {
        return { name: name, id: id }
    }

    createCustomer(customerData: CustomerDTO): Promise<CustomerEntity> {
        return this.customerRepository.save(customerData);
    }

    updateCustomer(id: number, updateCustomer: CustomerDTO): CustomerDTO {
        return updateCustomer;
    }

}
