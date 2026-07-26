import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { CustomerController } from './customer.controller';
import { CustomerService } from './customer.service';
import { CustomerEntity } from "./customer.entity";
import { OrderEntity } from '../order/order.entity';
import { OrderDetailsEntity } from '../order/order-details.entity';
import { Product } from '../product/product.entity';
import { PaymentEntity } from '../payment/payment.entity';
import { DeliveryEntity } from '../delivery/delivery.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
    imports: [
        TypeOrmModule.forFeature([CustomerEntity, OrderEntity, OrderDetailsEntity, Product, PaymentEntity, DeliveryEntity]),
        MailerModule.forRoot({
            transport: {
                host: 'smtp.gmail.com',
                port: 465,
                ignoreTLS: true,
                secure: true,
                auth: {
                    user: 'your gmail account',
                    pass: 'generated password',
                },
            },
        }),
    ],
    controllers: [CustomerController],
    providers: [CustomerService],
    exports: [CustomerService],
})
export class CustomerModule { }
