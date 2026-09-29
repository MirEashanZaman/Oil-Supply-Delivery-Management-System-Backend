import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeliverymanEntity } from './deliveryman.entity';
import { DeliverymanService } from './deliveryman.service';
import { DeliverymanController } from './deliveryman.controller';
import { OrderEntity } from '../order/order.entity';
import { DeliveryEntity } from '../delivery/delivery.entity';
import { DeliverymanAuthModule } from './auth/auth.module';
import { MailerModule } from '@nestjs-modules/mailer';

@Module({
    imports: [
        TypeOrmModule.forFeature([DeliverymanEntity, OrderEntity, DeliveryEntity]),
        forwardRef(() => DeliverymanAuthModule),
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
    controllers: [DeliverymanController],
    providers: [DeliverymanService],
    exports: [DeliverymanService, TypeOrmModule],
})
export class DeliverymanModule { }
