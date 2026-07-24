import { Controller, Get, Post, Put, Patch, Body, Param } from '@nestjs/common';
import { ProductService } from './product.service';
import { Product } from './product.entity';

@Controller('product')
export class ProductController {
    constructor(private readonly productService: ProductService) { }

    @Post('create')
    async createProduct(@Body() productData: Partial<Product>) {
        return this.productService.createProduct(productData);
    }

    @Get('list')
    async getAllProducts() {
        return this.productService.getAllProducts();
    }

    @Put('update-price/:id')
    async updatePrice(@Param('id') id: string, @Body('price') price: number) {
        return this.productService.updatePrice(Number(id), price);
    }

    @Put('update-stock/:id')
    async updateStock(@Param('id') id: string, @Body('stock') stock: number) {
        return this.productService.updateStock(Number(id), stock);
    }

    @Patch('patch-stock/:id')
    async patchStock(@Param('id') id: string, @Body('stock') stock: number) {
        return this.productService.updateStock(Number(id), stock);
    }
}
