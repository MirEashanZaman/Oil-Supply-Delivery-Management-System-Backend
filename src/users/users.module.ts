import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { CustomerEntity } from '../customer/customer.entity';
import { AdminEntity } from '../admin/admin.entity';
import { Dealer } from '../dealer/dealer.entity';
import { SupplierEntity } from '../supplier/supplier.entity';
import { DeliverymanEntity } from '../deliveryman/deliveryman.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            CustomerEntity,
            AdminEntity,
            Dealer,
            SupplierEntity,
            DeliverymanEntity,
        ]),
    ],
    controllers: [UsersController],
    providers: [UsersService],
    exports: [UsersService],
})
export class UsersModule { }
