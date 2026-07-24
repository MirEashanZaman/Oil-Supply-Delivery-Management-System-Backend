import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeliveryEntity } from './delivery.entity';

@Module({
    imports: [TypeOrmModule.forFeature([DeliveryEntity])],
    exports: [TypeOrmModule],
})
export class DeliveryModule { }
