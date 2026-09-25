import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MailerModule } from '@nestjs-modules/mailer';
import { SupplierController } from './supplier.controller';
import { SupplierService } from './supplier.service';
import { SupplierEntity } from "./supplier.entity";
import { Product } from '../product/product.entity';

import { OrderEntity } from '../order/order.entity';
import { DeliveryEntity } from '../delivery/delivery.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([SupplierEntity, Product, OrderEntity, DeliveryEntity]),
        MailerModule.forRoot({
            transport: {
                host: 'smtp.gmail.com',
                port: 465,
                ignoreTLS: true,
                secure: true,
                auth: {
                    user: 'eshan.zaman570@gmail.com',
                    pass: 'regz wnfi qyek wcpr',
                },
            },
        }),
    ],
    controllers: [SupplierController],
    providers: [SupplierService],
    exports: [SupplierService],
})
export class SupplierModule { }