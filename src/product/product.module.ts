import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './product.entity';
import { Category } from '../category/category.entity';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { OrderEntity } from '../order/order.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Product, Category, OrderEntity])],
    controllers: [ProductController],
    providers: [ProductService],
    exports: [ProductService, TypeOrmModule],
})
export class ProductModule { }
