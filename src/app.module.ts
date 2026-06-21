import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CustomerModule } from './customer/customer.module';
import { SupplierModule } from './supplier/supplier.module';

@Module({
  imports: [CustomerModule, SupplierModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
