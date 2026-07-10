import { Module } from '@nestjs/common';
import { SupplierController } from './supplier.controller';
import { SupplierService } from './supplier.service';
import { SupplierEntity } from "./supplier.entity";
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
    imports: [TypeOrmModule.forFeature([SupplierEntity]),],
    controllers: [SupplierController],
    providers: [SupplierService],
})
export class SupplierModule { }