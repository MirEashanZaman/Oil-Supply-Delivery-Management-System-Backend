import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CustomerModule } from './customer/customer.module';
import { SupplierModule } from './supplier/supplier.module';
import { DealerModule } from './dealer/dealer.module';
import { AdminModule } from './admin/admin.module';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [AdminModule, CustomerModule, SupplierModule, DealerModule, TypeOrmModule.forRoot(
    {
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'Nusrat',
      database: 'oil supply',
      autoLoadEntities: true,
      synchronize: true,
    }
  ),],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }

