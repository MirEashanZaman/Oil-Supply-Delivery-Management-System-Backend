import { Injectable } from "@nestjs/common";

@Injectable()
export class AdminService {
    getAdmin(): string {
        return "Admin";
    }

    getAllAdmin(): object {
        return { name: "ABC", id: "1" }
    }

    getAdminByID(id: number, name: string): object {
        return { name: name, id: id }
    }

    getAdminByIDandName(id: number, name: string): object {
        return { name: name, id: id }
    }
}