import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CustomerModule } from './customer/customer.module';
import { SupplierModule } from './supplier/supplier.module';
import { DealerModule } from './dealer/dealer.module';
import { AdminModule } from './admin/admin.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
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
import { DeliverymanModule } from './deliveryman/deliveryman.module';
import { DeliverymanAuthModule } from './deliveryman/auth/auth.module';
import { RabbitMQModule } from './rabbitmq/rabbitmq.module';
import { RedisModule } from './redis/redis.module';
import { XssSanitizerMiddleware } from './common/xss-sanitizer.middleware';
import { ObservabilityMiddleware } from './patterns/observability/observability.middleware';
import { RateLimiterMiddleware } from './patterns/rate-limit/rate-limiter.middleware';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { AdminEntity } from './admin/admin.entity';
import { Product } from './product/product.entity';
import { CustomerEntity } from './customer/customer.entity';
import { Dealer } from './dealer/dealer.entity';
import { SupplierEntity } from './supplier/supplier.entity';

async function seedFallbackDatabase(ds: DataSource) {
  try {
    const adminRepo = ds.getRepository(AdminEntity);
    if ((await adminRepo.count()) === 0) {
      await adminRepo.save([
        {
          id: 1,
          email: 'tisha@gmail.com',
          password:
            '$2b$10$vibyvSXEVSz3JTlRmoLdaOqbXZ8Io37mxaqzPOY7Olhi4eJ6Be7ia',
          filename: '1788597948515ChatGPT Image Jul 27, 2026, 12_19_15 AM.png',
          adminId: 'e9dde5f9-6597-424f-a5ad-ac97c708c673',
          phoneNumber: '01555555555',
          userName: 'Tisha',
          address: 'Bashundhara, Dhaka.',
          title: 'Admin',
        },
        {
          id: 2,
          email: 'israt@gmail.com',
          password:
            '$2b$10$EIqGet/Mh229QBRTzzd2luRa0Ar7GnB79OLRDtbLcFRZ65lSPDjy6',
          filename: '1789148179998Image (4).jpg',
          adminId: '3e4999f9-ea1b-42c3-8282-a942ec8a3adf',
          phoneNumber: '01878798798',
          userName: 'Israt',
          address: 'Bangladesh',
          title: 'Admin',
        },
      ]);
    }

    const productRepo = ds.getRepository(Product);
    if ((await productRepo.count()) === 0) {
      await productRepo.save([
        {
          id: 1,
          productId: '8c8ac9db-fa35-4f35-ad7f-25743f2d677d',
          name: 'Brent Crude Oil',
          quantity: 1499,
          price: 85,
        },
        {
          id: 2,
          productId: '46140349-698e-47f7-a7ee-224297b8d509',
          name: 'Ultra-Low Sulfur Diesel',
          quantity: 2497,
          price: 3.2,
        },
        {
          id: 3,
          productId: '057ef9af-5c57-4c48-a268-c15e075f960e',
          name: 'Premium Unleaded Gasoline',
          quantity: 1799,
          price: 3.85,
        },
        {
          id: 4,
          productId: '39b1bce7-66ca-4010-b41c-06f9307b4db2',
          name: 'Aviation Turbine Fuel (Jet A-1)',
          quantity: 3200,
          price: 2.95,
        },
        {
          id: 5,
          productId: '4483a507-9c95-49b0-8f64-d99e5e8a2c54',
          name: 'Liquefied Petroleum Gas (LPG)',
          quantity: 1400,
          price: 1.8,
        },
        {
          id: 6,
          productId: '53bc54a3-91a5-4b64-bdd5-1011a8447a82',
          name: 'Heavy Marine Fuel Oil (HFO)',
          quantity: 800,
          price: 620,
        },
        {
          id: 30,
          productId: 'a5174609-0baa-4e03-bed2-e08f0c286a2a',
          name: 'Octane Booster',
          quantity: 4985,
          price: 10,
        },
      ]);
    }

    const customerRepo = ds.getRepository(CustomerEntity);
    if ((await customerRepo.count()) === 0) {
      await customerRepo.save([
        {
          id: 1,
          customerId: 'be7fc999-5983-4e7a-af46-ec6b198f000c',
          username: 'Mir Eashan Zaman',
          email: 'eshan.zaman570@gmail.com',
          password:
            '$2b$10$TUhX/8L6rdPxiFVR6ON38.SqcBOo11schGDkxKCD4R6oAjt3D/DRC',
          filename: '1787926914243ChatGPT Image Jul 27, 2026, 12_19_15 AM.png',
          phoneNumber: '01952597587',
          address: '408/1 (Old KA 66/1), Kuratoli',
          title: 'Customer',
        },
      ]);
    }

    const dealerRepo = ds.getRepository(Dealer);
    if ((await dealerRepo.count()) === 0) {
      await dealerRepo.save([
        {
          id: 1,
          email: 'kowshik@gmail.com',
          password:
            '$2b$10$SznqVpOkgHzj6HC7FjiR.umzyGD5i0mMbioW.qS.dkdvkOW4emRQS',
          filename: '1788631430101ChatGPT Image Jul 27, 2026, 12_19_15 AM.png',
          dealerId: '3e441d37-6617-41c8-893a-d66dc7e11616',
          phoneNumber: '01343456767',
          userName: 'Kowshik',
          address: 'Dhaka',
          title: 'Dealer',
        },
        {
          id: 2,
          email: 'miltonn@gmail.com',
          password:
            '$2b$10$XEy4WkQcsCiOywBlX3APUeGUP82aAedQyeet5HKRKkgEyAF8A9taG',
          dealerId: 'd1858090-4878-4bf6-95c5-a8a10a2de640',
          phoneNumber: '+8801876787678',
          userName: 'Milton',
          address: 'Kuratoli, Dhaka!',
          title: 'Dealer',
        },
      ]);
    }

    const supplierRepo = ds.getRepository(SupplierEntity);
    if ((await supplierRepo.count()) === 0) {
      await supplierRepo.save([
        {
          id: 1,
          status: 'active',
          email: 'nowshin@gmail.com',
          password:
            '$2b$10$s9loCWody3mtUYUl3SXTuOLBarxX/7/bcFNqyMIO1PclwL92jwOp6',
          filename: '1788616468691ChatGPT Image Jul 27, 2026, 12_19_15 AM.png',
          phoneNumber: '01999999999',
          userName: 'Nowshin',
          address: 'Kuril, Dhaka.',
          title: 'Supplier',
        },
        {
          id: 2,
          status: 'active',
          email: 'tanjim@gmail.com',
          password:
            '$2b$10$EOdEitg1xEYp0EMA7/UhTuPRzEJJ4PZOWYtKzChyFzH80up44Fbbq',
          supplierId: 'c2c6e13b-7949-4ba6-95aa-ca47d766370a',
          phoneNumber: '+8801234543456',
          userName: 'Tanjim',
          address: 'Gazipur',
          title: 'Supplier',
        },
      ]);
    }
  } catch (seedErr: any) {
    console.warn(`[TypeORM] Fallback seed warning: ${seedErr?.message || seedErr}`);
  }
}

@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 100,
      },
    ]),
    RabbitMQModule,
    RedisModule,
    AdminModule,
    CustomerModule,
    SupplierModule,
    DealerModule,
    CategoryModule,
    ProductModule,
    PaymentModule,
    DeliveryModule,
    DeliverymanModule,
    ReviewModule,
    TypeOrmModule.forRootAsync({
      useFactory: () =>
        process.env.DATABASE_URL
          ? {
              type: 'postgres',
              url: process.env.DATABASE_URL,
              autoLoadEntities: true,
              manualInitialization: true,
              retryAttempts: 1,
              retryDelay: 1000,
              extra: { connectionTimeoutMillis: 5000 },
              synchronize:
                process.env.DB_SYNCHRONIZE !== undefined
                  ? process.env.DB_SYNCHRONIZE === 'true'
                  : process.env.NODE_ENV !== 'production',
              ssl:
                process.env.DB_SSL === 'false'
                  ? false
                  : { rejectUnauthorized: false },
            }
          : {
              type: 'postgres',
              host: process.env.DB_HOST || 'localhost',
              port: Number(process.env.DB_PORT) || 5432,
              username: process.env.DB_USERNAME || 'postgres',
              password: process.env.DB_PASSWORD || '12345',
              database:
                process.env.DB_NAME ||
                'Oil-Supply-Delivery-Management-System',
              autoLoadEntities: true,
              manualInitialization: true,
              retryAttempts: 1,
              retryDelay: 1000,
              extra: { connectionTimeoutMillis: 5000 },
              synchronize:
                process.env.DB_SYNCHRONIZE !== undefined
                  ? process.env.DB_SYNCHRONIZE === 'true'
                  : process.env.NODE_ENV !== 'production',
              ssl:
                process.env.DB_SSL === 'true'
                  ? { rejectUnauthorized: false }
                  : false,
            },
      dataSourceFactory: async (options) => {
        const dataSource = new DataSource(options!);
        try {
          await dataSource.initialize();
          return dataSource;
        } catch (err: any) {
          const msg = String(err?.message || '');
          if (msg.includes('does not support SSL')) {
            dataSource.setOptions({ ssl: false } as any);
            try {
              await dataSource.initialize();
              return dataSource;
            } catch {}
          }
          if ((options as any)?.synchronize) {
            dataSource.setOptions({ synchronize: false });
            try {
              await dataSource.initialize();
              return dataSource;
            } catch {}
          }
          console.warn(
            `[TypeORM] PostgreSQL unreachable (${msg || 'offline'}). Activating in-memory SQLite (sql.js) fallback...`,
          );
          const fallbackDataSource = new DataSource({
            type: 'sqljs',
            entities: (options as any)?.entities || [],
            synchronize: true,
          });
          await fallbackDataSource.initialize();
          await seedFallbackDatabase(fallbackDataSource);
          console.log('[TypeORM] In-memory SQLite (sql.js) fallback initialized and seeded.');
          return fallbackDataSource;
        }
      },
    }),
    AuthModule,
    AdminAuthModule,
    DealerAuthModule,
    SupplierAuthModule,
    DeliverymanAuthModule,
    UsersModule,
  ],

  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(
        XssSanitizerMiddleware,
        ObservabilityMiddleware,
        RateLimiterMiddleware,
      )
      .forRoutes('*');
  }
}
