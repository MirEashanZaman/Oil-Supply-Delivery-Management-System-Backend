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
        const tryInitialize = async () => {
          try {
            if (!dataSource.isInitialized) {
              await dataSource.initialize();
            }
            return true;
          } catch (err: any) {
            const msg = String(err?.message || '');
            if (msg.includes('does not support SSL')) {
              dataSource.setOptions({ ssl: false } as any);
              try {
                await dataSource.initialize();
                return true;
              } catch {}
            }
            if ((options as any)?.synchronize) {
              dataSource.setOptions({ synchronize: false });
              try {
                await dataSource.initialize();
                return true;
              } catch {}
            }
            console.warn(
              `[TypeORM] Database connection deferred (${msg || 'offline'}). Continuing startup.`,
            );
            return false;
          }
        };

        const connected = await tryInitialize();
        if (!connected) {
          const retryInBackground = (attempt = 1) => {
            if (dataSource.isInitialized || attempt > 20) return;
            setTimeout(async () => {
              const ok = await tryInitialize();
              if (!ok) retryInBackground(attempt + 1);
            }, 5000);
          };
          retryInBackground();
        }
        return dataSource;
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
