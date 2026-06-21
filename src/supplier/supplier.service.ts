import { Injectable } from "@nestjs/common";

@Injectable()
export class SupplierService {
    getSupplier(): string {
        return "Nusrat";
    }

    getAllSupplier(): object {
        return { name: "Nowshin", id: "101" }
    }

    getSupplierByID(id: number, name: string): object {
        return { name: name, id: id }
    }

    getSupplierByIDandName(id: number, name: string): object {
        return { name: name, id: id }
    }
}


