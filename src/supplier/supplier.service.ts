import { Injectable, NotFoundException, BadRequestException, HttpException, HttpStatus } from "@nestjs/common";
import { SupplierDTO } from "./supplier.dto";
import { SupplierEntity } from "./supplier.entity";
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { UpdateResult } from "typeorm";
import { MailerService } from '@nestjs-modules/mailer';
import { Product } from '../product/product.entity';
import * as bcrypt from 'bcrypt';
import { OrderEntity } from '../order/order.entity';
import { DeliveryEntity } from '../delivery/delivery.entity';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class SupplierService {
    constructor(
        @InjectRepository(SupplierEntity) private SupplierRepository: Repository<SupplierEntity>,
        @InjectRepository(Product) private productRepository: Repository<Product>,
        @InjectRepository(OrderEntity) private orderRepository: Repository<OrderEntity>,
        @InjectRepository(DeliveryEntity) private deliveryRepository: Repository<DeliveryEntity>,
        private mailerService: MailerService,
        private redisService: RedisService,
    ) { }

    async sendEmail(to: string, subject: string, text: string) {
        return await this.mailerService.sendMail({
            to: to,
            subject: subject,
            text: text,
        });
    }
    getSupplier(): string {
        return "Nusrat";
    }

    private sanitizeSupplier(sup: any) {
        if (!sup) return sup;
        const { password, ...safeSup } = sup;
        return safeSup;
    }

    async getAllSupplier(): Promise<SupplierEntity[]> {
        const cacheKey = 'suppliers:all';
        try {
            const cached = await this.redisService.get(cacheKey);
            if (cached) return JSON.parse(cached);
        } catch {}

        const suppliers = await this.SupplierRepository.find();
        const safeSuppliers = suppliers.map((s) => this.sanitizeSupplier(s));
        try {
            await this.redisService.set(cacheKey, JSON.stringify(safeSuppliers), 60);
        } catch {}
        return safeSuppliers as SupplierEntity[];
    }

    getSupplierByID(id: number, userName: string): object {
        return { userName: userName, id: id }
    }

    getSupplierByIDandName(id: number, userName: string): object {
        return this.SupplierRepository.findOneBy({ id: id, userName: userName });
    }

    async createSupplier(supplierData: SupplierDTO): Promise<SupplierEntity> {
        const existing = await this.SupplierRepository.findOneBy({ email: supplierData.email as string });
        if (existing) {
            throw new HttpException('Supplier already exists', HttpStatus.CONFLICT);
        }

        const isHashed = supplierData.password && /^\$2[aby]\$\d{2}\$/.test(supplierData.password);
        const hashedPassword = supplierData.password
            ? (isHashed ? supplierData.password : await bcrypt.hash(supplierData.password, 10))
            : undefined;
        const saved = await this.SupplierRepository.save({
            ...supplierData,
            password: hashedPassword,
        });
        try {
            await this.redisService.del('suppliers:all');
        } catch {}
        return saved;
    }

    async updateSupplier(id: number, status: string): Promise<UpdateResult> {
        const res = await this.SupplierRepository.update(id, { status });
        try {
            await this.redisService.del('suppliers:all');
        } catch {}
        return res;
    }

    getInactiveSupplier(): Promise<SupplierEntity[]> {
        return this.SupplierRepository.find({
            where: {
                status: 'inactive'
            }
        });
    }

    async findByEmail(email: string): Promise<SupplierEntity | null> {
        const cacheKey = `supplier:email:${email}`;
        try {
            const cached = await this.redisService.get(cacheKey);
            if (cached) return JSON.parse(cached);
        } catch {}

        const supplier = await this.SupplierRepository.findOneBy({ email });
        if (supplier) {
            try {
                await this.redisService.set(cacheKey, JSON.stringify(supplier), 60);
            } catch {}
        }
        return supplier;
    }

    async confirmOrder(orderId: number, status: string = 'confirmed') {
        const normalized = (status || 'confirmed').trim().toLowerCase();
        if (normalized === 'delivered') {
            throw new BadRequestException('Suppliers cannot mark orders as delivered. Only delivery personnel can complete deliveries.');
        }

        const order = await this.orderRepository.findOne({ where: { id: orderId } });
        if (!order) throw new NotFoundException('Order not found');
        order.status = normalized;
        await this.orderRepository.save(order);

        const delivery = await this.deliveryRepository.findOne({
            where: { orderDetails: { order: { id: orderId } } }
        });
        if (delivery) {
            delivery.deliveryStatus = normalized === 'accepted' || normalized === 'confirmed' ? 'processing' : 'rejected';
            await this.deliveryRepository.save(delivery);
        }

        return { order, delivery, message: `Order status updated to ${normalized} by supplier` };
    }

    async scheduleDelivery(orderId: number, deliveryDate: string) {
        const order = await this.orderRepository.findOne({ where: { id: orderId } });
        if (!order) throw new NotFoundException('Order not found');

        const delivery = await this.deliveryRepository.findOne({
            where: { orderDetails: { order: { id: orderId } } }
        });
        if (delivery) {
            delivery.deliveryStatus = `scheduled (Date: ${deliveryDate})`;
            await this.deliveryRepository.save(delivery);
        }

        return { orderId, deliveryDate, delivery, message: "Delivery successfully scheduled by supplier" };
    }

    async deleteSupplier(id: number): Promise<void> {
        const supplier = await this.SupplierRepository.findOneBy({ id });
        await this.SupplierRepository.delete(id);
        try {
            await this.redisService.del('suppliers:all');
            if (supplier?.email) await this.redisService.del(`supplier:email:${supplier.email}`);
        } catch {}
    }

    async patchSupplier(id: number, data: Partial<SupplierDTO> & { username?: string }): Promise<SupplierEntity | null> {
        const updateData: any = { ...data };
        if (updateData.username && !updateData.userName) {
            updateData.userName = updateData.username;
        }
        delete updateData.username;
        if (updateData.password) {
            const isHashed = /^\$2[aby]\$\d{2}\$/.test(updateData.password);
            if (!isHashed) {
                updateData.password = await bcrypt.hash(updateData.password, 10);
            }
        }
        await this.SupplierRepository.update(id, updateData);
        const updated = await this.SupplierRepository.findOneBy({ id });
        try {
            await this.redisService.del('suppliers:all');
            if (updated?.email) await this.redisService.del(`supplier:email:${updated.email}`);
        } catch {}
        return updated;
    }

    async assignProducts(supplierId: number, productIds: number[]): Promise<SupplierEntity> {
        const sup = await this.SupplierRepository.findOne({ where: { id: supplierId }, relations: { products: true } });
        if (!sup) throw new NotFoundException('Supplier not found');
        const products = await this.productRepository.createQueryBuilder('product').where('product.id IN (:...ids)', { ids: productIds }).getMany();
        sup.products = [...(sup.products || []), ...products];
        return this.SupplierRepository.save(sup);
    }

    async getProducts(supplierId: number): Promise<Product[]> {
        const sup = await this.SupplierRepository.findOne({ where: { id: supplierId }, relations: { products: true } });
        if (!sup) throw new NotFoundException('Supplier not found');
        return sup.products || [];
    }

    async removeProduct(supplierId: number, productId: number): Promise<void> {
        const sup = await this.SupplierRepository.findOne({ where: { id: supplierId }, relations: { products: true } });
        if (!sup) throw new NotFoundException('Supplier not found');
        sup.products = (sup.products || []).filter(p => p.id !== productId);
        await this.SupplierRepository.save(sup);
    }
}



