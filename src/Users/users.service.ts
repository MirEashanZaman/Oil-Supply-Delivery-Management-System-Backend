import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CustomerEntity } from '../customer/customer.entity';
import { AdminEntity } from '../admin/admin.entity';
import { Dealer } from '../dealer/dealer.entity';
import { SupplierEntity } from '../supplier/supplier.entity';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(CustomerEntity)
        private customerRepo: Repository<CustomerEntity>,
        @InjectRepository(AdminEntity)
        private adminRepo: Repository<AdminEntity>,
        @InjectRepository(Dealer)
        private dealerRepo: Repository<Dealer>,
        @InjectRepository(SupplierEntity)
        private supplierRepo: Repository<SupplierEntity>,
    ) { }

    async getAllUsers() {
        const customers = await this.customerRepo.find();
        const admins = await this.adminRepo.find();
        const dealers = await this.dealerRepo.find();
        const suppliers = await this.supplierRepo.find();

        return {
            customers: customers,
            admins: admins,
            dealers: dealers,
            suppliers: suppliers,
        };
    }

    async searchUserByEmail(email: string) {
        const customer = await this.customerRepo.findOneBy({ email });
        if (customer) {
            return { user: customer, role: 'customer' };
        }

        const admin = await this.adminRepo.findOneBy({ email });
        if (admin) {
            return { user: admin, role: 'admin' };
        }

        const dealer = await this.dealerRepo.findOneBy({ email });
        if (dealer) {
            return { user: dealer, role: 'dealer' };
        }

        const supplier = await this.supplierRepo.findOneBy({ email });
        if (supplier) {
            return { user: supplier, role: 'supplier' };
        }

        return { message: 'User not found' };
    }
}
