import { Module } from '@nestjs/common';
import { CustomerController } from './customer.controller';
import { CustomerService } from './customer.service';
import { CustomerEntity } from "./customer.entity";
import { OrderEntity } from '../order/order.entity';
import { OrderDetailsEntity } from '../order/order-details.entity';
import { Product } from '../product/product.entity';
import { TypeOrmModule } from '@nestjs/typeorm';


@Module({
    imports: [TypeOrmModule.forFeature([CustomerEntity, OrderEntity, OrderDetailsEntity, Product])],
    controllers: [CustomerController],
    providers: [CustomerService],
    exports: [CustomerService],
})
export class CustomerModule { }
