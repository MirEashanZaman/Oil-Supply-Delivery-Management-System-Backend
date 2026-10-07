import { Controller, Get, Post, Put, Patch, Delete, Body, Param, UseInterceptors, UploadedFile, UseGuards } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ProductService } from './product.service';
import { Product } from './product.entity';
import { AuthGuard } from '../customer/auth/auth.guard';
import { createSecureUploadOptions } from '../common/upload-security';

@Controller('product')
export class ProductController {
    constructor(private readonly productService: ProductService) { }

    @Post('create')
    @UseGuards(AuthGuard)
    @UseInterceptors(FileInterceptor('photo', createSecureUploadOptions('photo', 30 * 1024 * 1024)))
    async createProduct(
        @Body() productData: Partial<Product>,
        @UploadedFile() file?: Express.Multer.File,
    ) {
        const payload = { ...productData };
        if (file?.filename) {
            payload.image = `/uploads/${file.filename}`;
        }
        return this.productService.createProduct(payload);
    }

    @Get('list')
    async getAllProducts() {
        return this.productService.getAllProducts();
    }

    @Put('update-price/:id')
    @UseGuards(AuthGuard)
    async updatePrice(@Param('id') id: string, @Body('price') price: number) {
        return this.productService.updatePrice(Number(id), price);
    }

    @Put('update-stock/:id')
    @UseGuards(AuthGuard)
    async updateStock(@Param('id') id: string, @Body('stock') stock: number) {
        return this.productService.updateStock(Number(id), stock);
    }

    @Patch('patch-stock/:id')
    @UseGuards(AuthGuard)
    async patchStock(@Param('id') id: string, @Body('stock') stock: number) {
        return this.productService.updateStock(Number(id), stock);
    }

    @Post('add-category')
    @UseGuards(AuthGuard)
    async addProductToCategory(@Body('productId') productId: number, @Body('categoryId') categoryId: number) {
        return this.productService.addProductToCategory(productId, categoryId);
    }

    @Delete('remove-category/:productId/:categoryId')
    @UseGuards(AuthGuard)
    async removeProductFromCategory(@Param('productId') productId: string, @Param('categoryId') categoryId: string) {
        return this.productService.removeProductFromCategory(Number(productId), Number(categoryId));
    }

    @Delete(':id')
    @UseGuards(AuthGuard)
    async deleteProduct(@Param('id') id: string) {
        return this.productService.deleteProduct(Number(id));
    }

    @Get('with-categories')
    async getProductsWithCategories() {
        return this.productService.getProductsWithCategories();
    }
}
