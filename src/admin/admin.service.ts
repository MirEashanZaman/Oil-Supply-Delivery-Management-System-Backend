import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { AdminEntity } from "./admin.entity";
import { AdminDTO } from "./admin.dto";

@Injectable()
export class AdminService {

    constructor(
        @InjectRepository(AdminEntity)
        private adminRepo: Repository<AdminEntity>,
    ) { }

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
        const admin = this.adminRepo.create(adminData);
        return await this.adminRepo.save(admin);
    }


    async updateCountry(id: number, country: string): Promise<any> {
        await this.adminRepo.update(id, { country });
        return this.adminRepo.findOneBy({ id });
    }


    async getByJoiningDate(date: string): Promise<AdminEntity[]> {
        return await this.adminRepo
            .createQueryBuilder("admin")
            .where("DATE(admin.joiningDate) = :date", { date })
            .getMany();
    }

    async getUnknownCountryUsers(): Promise<AdminEntity[]> {
        return await this.adminRepo.find({
            where: {
                country: "Unknown",
            },
        });
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
}