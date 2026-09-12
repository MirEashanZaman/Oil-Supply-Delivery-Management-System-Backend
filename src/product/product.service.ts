import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './product.entity';
import { Category } from '../category/category.entity';
import { OrderEntity } from '../order/order.entity';
import { OrderDetailsEntity } from '../order/order-details.entity';

@Injectable()
export class ProductService {
    constructor(
        @InjectRepository(Product)
        private productRepository: Repository<Product>,
        @InjectRepository(Category)
        private categoryRepository: Repository<Category>,
        @InjectRepository(OrderEntity)
        private orderRepository: Repository<OrderEntity>,
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
        return this.productRepository.find({ relations: { categories: true, suppliers: true, dealers: true } });
    }

    async updateProductQuantity(productId: number, quantity: number): Promise<Product | { message: string }> {
        if (quantity < 0) {
            return { message: "Quantity cannot be less than 0" };
        }
        const product = await this.productRepository.findOneBy({ id: productId });
        if (!product) {
            return { message: "Product not found" };
        }
        product.quantity = quantity;
        return this.productRepository.save(product);
    }

    async createProduct(productData: Partial<Product>): Promise<Product> {
        const product = this.productRepository.create(productData);
        return this.productRepository.save(product);
    }

    async getAllProducts(): Promise<Product[]> {
        return this.productRepository.find({ relations: { categories: true, suppliers: true, dealers: true } });
    }

    async updatePrice(productId: number, price: number): Promise<Product | { message: string }> {
        if (price < 0) {
            return { message: "Price cannot be less than 0" };
        }
        const product = await this.productRepository.findOneBy({ id: productId });
        if (!product) {
            return { message: "Product not found" };
        }
        product.price = price;
        return this.productRepository.save(product);
    }

    async deleteProduct(productId: number): Promise<{ message: string }> {
        const product = await this.productRepository.findOne({
            where: { id: productId },
            relations: { categories: true, suppliers: true, dealers: true },
        });

        if (!product) {
            return { message: 'Product not found' };
        }

        await this.productRepository.manager.transaction(async (manager) => {
            const categoryRepo = manager.getRepository(Category);
            const orderRepo = manager.getRepository(OrderEntity);
            const orderDetailsRepo = manager.getRepository(OrderDetailsEntity);
            const productRepo = manager.getRepository(Product);

            await manager.query('DELETE FROM "order_details_entity" WHERE "productId" = $1', [productId]);
            await manager.query('DELETE FROM "order_entity" WHERE "productId" = $1', [productId]);
            await manager.query('DELETE FROM "supplier_products" WHERE "productId" = $1', [productId]);
            await manager.query('DELETE FROM "dealer_products" WHERE "productId" = $1', [productId]);
            await categoryRepo.delete({ product: { id: productId } as any });
            await orderRepo.delete({ product: { id: productId } as any });
            await orderDetailsRepo.delete({ product: { id: productId } as any });

            await productRepo.delete(productId);
        });

        return { message: 'Product deleted successfully' };
    }

    async updateStock(productId: number, stock: number): Promise<Product | { message: string }> {
        return this.updateProductQuantity(productId, stock);
    }
}