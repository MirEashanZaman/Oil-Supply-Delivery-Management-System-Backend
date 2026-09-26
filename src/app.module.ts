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
import { UsersModule } from './users/users.module';
import { CategoryModule } from './category/category.module';
import { ProductModule } from './product/product.module';
import { PaymentModule } from './payment/payment.module';
import { DeliveryModule } from './delivery/delivery.module';
import { ReviewModule } from './review/review.module';

@Module({
  imports: [
    AdminModule,
    CustomerModule,
    SupplierModule,
    DealerModule,
    CategoryModule,
    ProductModule,
    PaymentModule,
    DeliveryModule,
    ReviewModule,
    TypeOrmModule.forRoot(
      process.env.DATABASE_URL
        ? {
            type: 'postgres',
            url: process.env.DATABASE_URL,
            autoLoadEntities: true,
            synchronize: true,
            ssl: process.env.DB_SSL === 'false' ? false : { rejectUnauthorized: false },
          }
        : {
            type: 'postgres',
            host: process.env.DB_HOST || 'localhost',
            port: Number(process.env.DB_PORT) || 5432,
            username: process.env.DB_USERNAME || 'postgres',
            password: process.env.DB_PASSWORD || '12345',
            database: process.env.DB_NAME || 'Oil-Supply-Delivery-Management-System',
            autoLoadEntities: true,
            synchronize: true,
            ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
          },
    ),
    AuthModule,
    AdminAuthModule,
    DealerAuthModule,
    SupplierAuthModule,
    UsersModule,
  ],

  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }

