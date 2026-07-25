import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { SupplierDTO } from "./supplier.dto";
import { SupplierEntity } from "./supplier.entity";
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { UpdateResult } from "typeorm";
import { MailerService } from '@nestjs-modules/mailer';
import { Product } from '../product/product.entity';


@Injectable()
export class SupplierService {
    constructor(
        @InjectRepository(SupplierEntity) private SupplierRepository: Repository<SupplierEntity>,
        @InjectRepository(Product) private productRepository: Repository<Product>,
        private mailerService: MailerService,
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

    getAllSupplier(): object {
        return this.SupplierRepository.find();
    }

    getSupplierByID(id: number, fullname: string): object {
        return { fullname: fullname, id: id }
    }

    getSupplierByIDandName(id: number, fullname: string): object {
        return this.SupplierRepository.findOneBy({ id: id, fullname: fullname });
    }

    createSupplier(supplierData: SupplierDTO): Promise<SupplierEntity> {
        return this.SupplierRepository.save(supplierData);
    }


    updateSupplier(id: number, status: string): Promise<UpdateResult> {

        return this.SupplierRepository.update(id, { status });
    }

    getInactiveSupplier(): Promise<SupplierEntity[]> {
        return this.SupplierRepository.find({
            where: {
                status: 'inactive'
            }
        });
    }

    getSupplierOld40(): Promise<SupplierEntity[]> {
        return this.SupplierRepository.createQueryBuilder("supplier").where("supplier.age>:age", { age: 40 }).getMany();
    }

    async findByEmail(email: string): Promise<SupplierEntity | null> {
        return await this.SupplierRepository.findOneBy({ email });
    }

    confirmOrder(orderId: number, status: string = 'confirmed') {
        return { orderId: orderId, status: status, message: "Order confirmed by supplier" };
    }

    scheduleDelivery(orderId: number, deliveryDate: string) {
        return { orderId: orderId, deliveryDate: deliveryDate, message: "Delivery scheduled" };
    }

    async deleteSupplier(id: number): Promise<void> {
        await this.SupplierRepository.delete(id);
    }

    async patchSupplier(id: number, data: Partial<SupplierDTO>): Promise<SupplierEntity | null> {
        await this.SupplierRepository.update(id, data);
        return this.SupplierRepository.findOneBy({ id });
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



