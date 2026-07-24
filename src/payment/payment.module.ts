import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentEntity } from './payment.entity';

import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';

@Module({
    imports: [TypeOrmModule.forFeature([PaymentEntity])],
    controllers: [PaymentController],
    providers: [PaymentService],
    exports: [PaymentService, TypeOrmModule],
})
export class PaymentModule { }
