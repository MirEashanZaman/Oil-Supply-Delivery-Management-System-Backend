import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CustomerModule } from './customer/customer.module';
import { SupplierModule } from './supplier/supplier.module';
import { DealerModule } from './dealer/dealer.module';
import { AdminModule } from './admin/admin.module';
import { TypeOrmModule } from '@nestjs/typeorm/dist/typeorm.module';
import { AuthModule } from './customer/auth/auth.module';
import { AuthModule as AdminAuthModule } from './admin/auth/auth.module';
import { AuthModule as DealerAuthModule } from './dealer/auth/auth.module';
import { AuthModule as SupplierAuthModule } from './supplier/auth/auth.module';
import { UsersModule } from './Users/users.module';
import { CategoryModule } from './category/category.module';
import { ProductModule } from './product/product.module';
import { PaymentModule } from './payment/payment.module';
import { DeliveryModule } from './delivery/delivery.module';

@Module({
  imports: [AdminModule, CustomerModule, SupplierModule, DealerModule, CategoryModule, ProductModule, PaymentModule, DeliveryModule, TypeOrmModule.forRoot(
    {
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: '12345',
      database: 'Oil-Supply-Delivery-Management-System',//Change to your database name
      autoLoadEntities: true,
      synchronize: true,
    }), AuthModule, AdminAuthModule, DealerAuthModule, SupplierAuthModule, UsersModule,],

  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
