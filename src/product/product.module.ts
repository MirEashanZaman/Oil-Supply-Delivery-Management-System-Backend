import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './product.entity';
import { Category } from '../category/category.entity';
import { ProductService } from './product.service';

@Module({
    imports: [TypeOrmModule.forFeature([Product, Category])],
    providers: [ProductService],
    exports: [ProductService, TypeOrmModule],
})
export class ProductModule { }
