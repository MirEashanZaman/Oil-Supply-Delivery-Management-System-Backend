import { Module } from '@nestjs/common';
import { CustomerController } from './customer.controller';
import { CustomerService } from './customer.service';
import { CustomerEntity } from "./customer.entity";
import { OrderEntity } from '../order/order.entity';
import { TypeOrmModule } from '@nestjs/typeorm';


@Module({
    imports: [TypeOrmModule.forFeature([CustomerEntity, OrderEntity])],
    controllers: [CustomerController],
    providers: [CustomerService],
})
export class CustomerModule { }
