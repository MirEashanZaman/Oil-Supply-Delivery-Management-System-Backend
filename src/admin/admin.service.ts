import { HttpException, HttpStatus, Injectable, ForbiddenException, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { AdminEntity } from "./admin.entity";
import { AdminDTO } from "./admin.dto";
import { CustomerEntity } from "../customer/customer.entity";
import { Dealer } from "../dealer/dealer.entity";
import { SupplierEntity } from "../supplier/supplier.entity";
import { OrderEntity } from "../order/order.entity";
import { CustomerDTO } from "../customer/customer.dto";
import { DealerDTO } from "../dealer/dealer.dto";
import { SupplierDTO } from "../supplier/supplier.dto";
import { MailerService } from '@nestjs-modules/mailer';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AdminService {

    constructor(
        @InjectRepository(AdminEntity)
        private adminRepo: Repository<AdminEntity>,
        @InjectRepository(CustomerEntity)
        private customerRepo: Repository<CustomerEntity>,
        @InjectRepository(Dealer)
        private dealerRepo: Repository<Dealer>,
        @InjectRepository(SupplierEntity)
        private supplierRepo: Repository<SupplierEntity>,
        @InjectRepository(OrderEntity)
        private orderRepo: Repository<OrderEntity>,
        private mailerService: MailerService,
    ) { }

    async sendEmail(to: string, subject: string, text: string) {
        return await this.mailerService.sendMail({
            to: to,
            subject: subject,
            text: text,
        });
    }

    getAdmin(): string {
        return "Admin";
    }


    async getAllUsers(): Promise<any[]> {
        const admins = await this.adminRepo.find();
        const customers = await this.customerRepo.find();
        const dealers = await this.dealerRepo.find();
        const suppliers = await this.supplierRepo.find();
        return [...admins, ...customers, ...dealers, ...suppliers];
    }


    getAdminByID(id: number): Promise<AdminEntity | null> {
        return this.adminRepo.findOneBy({ id });
    }

    async createAdmin(adminData: AdminDTO): Promise<AdminEntity> {
        const existing = await this.adminRepo.findOneBy({ email: adminData.email as string });
        if (existing) {
            throw new HttpException('Admin already exists', HttpStatus.CONFLICT);
        }

        const isHashed = adminData.password && /^\$2[aby]\$\d{2}\$/.test(adminData.password);
        const hashedPassword = adminData.password
            ? (isHashed ? adminData.password : await bcrypt.hash(adminData.password, 10))
            : undefined;

        const admin = this.adminRepo.create({
            ...adminData,
            password: hashedPassword,
        });
        return await this.adminRepo.save(admin);
    }


    async getByJoiningDate(date: string): Promise<any[]> {
        const admins = await this.adminRepo
            .createQueryBuilder("admin")
            .where("CAST(admin.joiningDate AS DATE) = :date", { date })
            .getMany();

        const customers = await this.customerRepo
            .createQueryBuilder("customer")
            .where("CAST(customer.joiningDate AS DATE) = :date", { date })
            .getMany();

        const dealers = await this.dealerRepo
            .createQueryBuilder("dealer")
            .where("CAST(dealer.joiningDate AS DATE) = :date", { date })
            .getMany();

        const suppliers = await this.supplierRepo
            .createQueryBuilder("supplier")
            .where("CAST(supplier.joiningDate AS DATE) = :date", { date })
            .getMany();

        return [...admins, ...customers, ...dealers, ...suppliers];
    }

    async findByEmail(email: string): Promise<AdminEntity | null> {
        return await this.adminRepo.findOneBy({ email });
    }

    async monitorData() {
        const totalAdmins = await this.adminRepo.count();
        return {
            totalAdmins: totalAdmins,
            systemStatus: "Active",
            monitoredAt: new Date(),
        };
    }

    async deleteAdmin(id: number, loggedInEmail: string): Promise<void> {
        const loggedInAdmin = await this.findByEmail(loggedInEmail);
        if (!loggedInAdmin) {
            throw new NotFoundException('Logged in admin not found');
        }
        if (loggedInAdmin.id !== id) {
            throw new ForbiddenException("You can delete yourself but you cannot delete another admin!");
        }
        await this.adminRepo.delete(id);
    }

    async patchAdmin(id: number, loggedInEmail: string, data: Partial<AdminDTO>): Promise<AdminEntity | null> {
        const loggedInAdmin = await this.findByEmail(loggedInEmail);
        if (!loggedInAdmin) {
            throw new NotFoundException('Logged in admin not found');
        }
        if (loggedInAdmin.id !== id) {
            throw new ForbiddenException("You can update yourself but you cannot update another admin!");
        }
        if (data.password) {
            const isHashed = /^\$2[aby]\$\d{2}\$/.test(data.password);
            if (!isHashed) {
                data.password = await bcrypt.hash(data.password, 10);
            }
        }
        await this.adminRepo.update(id, data);
        return this.adminRepo.findOneBy({ id });
    }

    // Customer CRUD
    async adminCreateCustomer(data: CustomerDTO): Promise<CustomerEntity> {
        const existing = await this.customerRepo.findOneBy({ email: data.email as string });
        if (existing) {
            throw new HttpException('Customer already exists', HttpStatus.CONFLICT);
        }
        const hashedPassword = data.password ? await bcrypt.hash(data.password, 10) : undefined;
        const customer = this.customerRepo.create({
            ...data,
            username: data.userName,
            password: hashedPassword,
            title: 'Customer'
        });
        return this.customerRepo.save(customer);
    }

    async adminUpdateCustomer(id: number, data: Partial<CustomerDTO>): Promise<CustomerEntity | null> {
        const customer = await this.customerRepo.findOneBy({ id });
        if (!customer) {
            throw new NotFoundException('Customer not found');
        }
        if (data.password) {
            data.password = await bcrypt.hash(data.password, 10);
        }
        await this.customerRepo.update(id, {
            ...data,
            username: data.userName
        });
        return this.customerRepo.findOneBy({ id });
    }

    async adminDeleteCustomer(id: number): Promise<void> {
        await this.customerRepo.delete(id);
    }

    // Dealer CRUD
    async adminCreateDealer(data: DealerDTO): Promise<Dealer> {
        const existing = await this.dealerRepo.findOneBy({ email: data.email as string });
        if (existing) {
            throw new HttpException('Dealer already exists', HttpStatus.CONFLICT);
        }
        const hashedPassword = data.password ? await bcrypt.hash(data.password, 10) : undefined;
        const dealer = this.dealerRepo.create({
            ...data,
            password: hashedPassword,
            title: 'Dealer',
            phone: data.phoneNumber ? Number(data.phoneNumber) : undefined
        });
        return this.dealerRepo.save(dealer);
    }

    async adminUpdateDealer(id: number, data: Partial<DealerDTO>): Promise<Dealer | null> {
        const dealer = await this.dealerRepo.findOneBy({ id });
        if (!dealer) {
            throw new NotFoundException('Dealer not found');
        }
        if (data.password) {
            data.password = await bcrypt.hash(data.password, 10);
        }
        await this.dealerRepo.update(id, {
            ...data,
            phone: data.phoneNumber ? Number(data.phoneNumber) : undefined
        });
        return this.dealerRepo.findOneBy({ id });
    }

    async adminDeleteDealer(id: number): Promise<void> {
        await this.dealerRepo.delete(id);
    }

    // Supplier CRUD
    async adminCreateSupplier(data: SupplierDTO): Promise<SupplierEntity> {
        const existing = await this.supplierRepo.findOneBy({ email: data.email as string });
        if (existing) {
            throw new HttpException('Supplier already exists', HttpStatus.CONFLICT);
        }
        const hashedPassword = data.password ? await bcrypt.hash(data.password, 10) : undefined;
        const supplier = this.supplierRepo.create({
            ...data,
            password: hashedPassword,
            title: 'Supplier'
        });
        return this.supplierRepo.save(supplier);
    }

    async adminUpdateSupplier(id: number, data: Partial<SupplierDTO>): Promise<SupplierEntity | null> {
        const supplier = await this.supplierRepo.findOneBy({ id });
        if (!supplier) {
            throw new NotFoundException('Supplier not found');
        }
        if (data.password) {
            data.password = await bcrypt.hash(data.password, 10);
        }
        await this.supplierRepo.update(id, data as any);
        return this.supplierRepo.findOneBy({ id });
    }

    async adminDeleteSupplier(id: number): Promise<void> {
        await this.supplierRepo.delete(id);
    }

    // Order CRUD (Update and Delete only, no creation)
    async adminUpdateOrder(id: number, data: Partial<OrderEntity>): Promise<OrderEntity | null> {
        const order = await this.orderRepo.findOneBy({ id });
        if (!order) {
            throw new NotFoundException('Order not found');
        }
        await this.orderRepo.update(id, data);
        return this.orderRepo.findOneBy({ id });
    }

    async adminDeleteOrder(id: number): Promise<void> {
        await this.orderRepo.delete(id);
    }
}