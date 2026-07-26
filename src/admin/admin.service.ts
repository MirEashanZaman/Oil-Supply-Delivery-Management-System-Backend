import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { AdminEntity } from "./admin.entity";
import { AdminDTO } from "./admin.dto";
import { MailerService } from '@nestjs-modules/mailer';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AdminService {

    constructor(
        @InjectRepository(AdminEntity)
        private adminRepo: Repository<AdminEntity>,
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


    getAllAdmin(): Promise<AdminEntity[]> {
        return this.adminRepo.find();
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


    async getByJoiningDate(date: string): Promise<AdminEntity[]> {
        return await this.adminRepo
            .createQueryBuilder("admin")
            .where("DATE(admin.joiningDate) = :date", { date })
            .getMany();
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

    async deleteAdmin(id: number): Promise<void> {
        await this.adminRepo.delete(id);
    }

    async patchAdmin(id: number, data: Partial<AdminDTO>): Promise<AdminEntity | null> {
        await this.adminRepo.update(id, data);
        return this.adminRepo.findOneBy({ id });
    }
}