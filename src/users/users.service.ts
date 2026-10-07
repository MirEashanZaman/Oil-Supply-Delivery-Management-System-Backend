import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CustomerEntity } from '../customer/customer.entity';
import { AdminEntity } from '../admin/admin.entity';
import { Dealer } from '../dealer/dealer.entity';
import { SupplierEntity } from '../supplier/supplier.entity';
import { DeliverymanEntity } from '../deliveryman/deliveryman.entity';
import { RedisService } from '../redis/redis.service';

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
        @InjectRepository(DeliverymanEntity)
        private deliverymanRepo: Repository<DeliverymanEntity>,
        private redisService: RedisService,
    ) { }

    private sanitizeUser(user: any) {
        if (!user) return user;
        const { password, ...safeUser } = user;
        return safeUser;
    }

    async getAllUsers() {
        const cacheKey = 'users:all_merged';
        const cached = await this.redisService.get(cacheKey);
        if (cached) return cached;

        const customers = (await this.customerRepo.find()).map((u) => this.sanitizeUser(u));
        const admins = (await this.adminRepo.find()).map((u) => this.sanitizeUser(u));
        const dealers = (await this.dealerRepo.find()).map((u) => this.sanitizeUser(u));
        const suppliers = (await this.supplierRepo.find()).map((u) => this.sanitizeUser(u));
        const deliverymen = (await this.deliverymanRepo.find()).map((u) => this.sanitizeUser(u));

        const result = {
            customers: customers,
            admins: admins,
            dealers: dealers,
            suppliers: suppliers,
            deliverymen: deliverymen,
        };

        await this.redisService.set(cacheKey, result, 30); // Cache for 30s
        return result;
    }

    async searchUserByEmail(email: string) {
        const cleanEmail = (email || '').toLowerCase().trim();
        const cacheKey = `user:email:${cleanEmail}`;
        const cached = await this.redisService.get(cacheKey);
        if (cached) return cached;

        const customer = await this.customerRepo.findOneBy({ email: cleanEmail });
        if (customer) {
            const res = { user: this.sanitizeUser(customer), role: 'customer' };
            await this.redisService.set(cacheKey, res, 60);
            return res;
        }

        const admin = await this.adminRepo.findOneBy({ email: cleanEmail });
        if (admin) {
            const res = { user: this.sanitizeUser(admin), role: 'admin' };
            await this.redisService.set(cacheKey, res, 60);
            return res;
        }

        const dealer = await this.dealerRepo.findOneBy({ email: cleanEmail });
        if (dealer) {
            const res = { user: this.sanitizeUser(dealer), role: 'dealer' };
            await this.redisService.set(cacheKey, res, 60);
            return res;
        }

        const supplier = await this.supplierRepo.findOneBy({ email: cleanEmail });
        if (supplier) {
            const res = { user: this.sanitizeUser(supplier), role: 'supplier' };
            await this.redisService.set(cacheKey, res, 60);
            return res;
        }

        const deliveryman = await this.deliverymanRepo.findOneBy({ email: cleanEmail });
        if (deliveryman) {
            const res = { user: this.sanitizeUser(deliveryman), role: 'deliveryman' };
            await this.redisService.set(cacheKey, res, 60);
            return res;
        }

        return { message: 'User not found' };
    }
}
