import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MailerModule } from '@nestjs-modules/mailer';
import { Dealer } from './dealer.entity';
import { DealerService } from './dealer.service';
import { DealerController } from './dealer.controller';
import { Product } from '../product/product.entity';

import { OrderEntity } from '../order/order.entity';
import { SupplierEntity } from '../supplier/supplier.entity';
import { DeliveryEntity } from '../delivery/delivery.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Dealer, Product, OrderEntity, SupplierEntity, DeliveryEntity]),
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
  controllers: [DealerController],
  providers: [DealerService],
  exports: [DealerService],
})
export class DealerModule { }