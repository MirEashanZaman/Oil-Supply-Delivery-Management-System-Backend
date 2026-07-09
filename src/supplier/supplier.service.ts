import { Injectable } from "@nestjs/common";
import { SupplierDTO } from "./supplier.dto";
import { SupplierEntity } from "./supplier.entity";
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class SupplierService {
    constructor(@InjectRepository(SupplierEntity) private SupplierRepository: Repository<SupplierEntity>) { }
    getSupplier(): string {
        return "Nusrat";
    }

    getAllSupplier(): object {
        return this.SupplierRepository.find();
    }

    getSupplierByID(id: number, name: string): object {
        return { name: name, id: id }
    }

    getSupplierByIDandName(id: number, name: string): object {
        return this.SupplierRepository.findOneBy({ id: id });
    }

    createSupplier(supplierData: SupplierDTO): Promise<SupplierEntity> {
        return this.SupplierRepository.save(supplierData);
    }

    updateSupplier(id: number, updateSupplier: SupplierDTO): SupplierDTO {
        return updateSupplier;
    }
}



