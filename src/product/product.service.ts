import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './product.entity';
import { Category } from '../category/category.entity';
@Injectable()
export class ProductService {
    constructor(
        @InjectRepository(Product)
        private productRepository: Repository<Product>,
        @InjectRepository(Category)
        private categoryRepository: Repository<Category>,
    ) { }
    async addProductToCategory(productId: number, categoryId: number): Promise<void> {
        const product = await this.productRepository.findOneBy({ id: productId });
        const category = await this.categoryRepository.findOneBy({ id: categoryId });
        if (product && category) {
            product.categories = [...(product.categories ?? []), category];
            await this.productRepository.save(product);
        }
    }
    async removeProductFromCategory(productId: number, categoryId: number): Promise<void> {
        const product = await this.productRepository.findOneBy({ id: productId });
        const category = await this.categoryRepository.findOneBy({ id: categoryId });
        if (product && category) {
            product.categories = (product.categories ?? []).filter((c) => c.id !== category.id);
            await this.productRepository.save(product);
        }
    }
    async getProductsWithCategories(): Promise<Product[]> {
        return this.productRepository.find({ relations: { categories: true } });
    }
}