import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MailerModule } from '@nestjs-modules/mailer';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { AdminEntity } from './admin.entity';

import { CustomerEntity } from '../customer/customer.entity';
import { Dealer } from '../dealer/dealer.entity';
import { SupplierEntity } from '../supplier/supplier.entity';
import { OrderEntity } from '../order/order.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([AdminEntity, CustomerEntity, Dealer, SupplierEntity, OrderEntity]),
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
    controllers: [AdminController],
    providers: [AdminService],
    exports: [AdminService],
})
export class AdminModule { }
