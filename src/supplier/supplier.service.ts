import { Injectable } from "@nestjs/common";
import { SupplierDTO } from "./supplier.dto";
import { SupplierEntity } from "./supplier.entity";
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { UpdateResult } from "typeorm";

@Injectable()
export class SupplierService {
    constructor(@InjectRepository(SupplierEntity) private SupplierRepository: Repository<SupplierEntity>) { }
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
}



