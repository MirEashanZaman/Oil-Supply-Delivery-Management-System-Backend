import { Controller, Get, Param, Query, Body, Post, UsePipes, ValidationPipe, Put, Patch, Delete, UseGuards, UseInterceptors, UploadedFile } from "@nestjs/common";
import { AuthGuard } from './auth/auth.guard';
import { SupplierService } from "./supplier.service"
import { SupplierDTO } from "./supplier.dto";
import { SupplierEntity } from "./supplier.entity";
import { FileInterceptor } from '@nestjs/platform-express';
import { MulterError, diskStorage } from 'multer';

@Controller('supplier')
@UseGuards(AuthGuard)
export class SupplierController {
    constructor(private readonly supplierService: SupplierService) { }
    @Get()
    getSupplier(): string {
        return this.supplierService.getSupplier();
    }

    @Get('getallsupplier')
    getAllSupplier(): object {
        return this.supplierService.getAllSupplier();
    }

    @Get('getsupplierbyid/:myid/geybyname/:name')
    getSupplierByID(@Param('myid') id: number, @Param('userName') userName: string): object {
        return this.supplierService.getSupplierByID(id, userName);
    }

    @Get('getsupplierbyidandname')
    getSupplierByIDandName(@Query('id') id: number, @Query('userName') userName: string): object {
        return this.supplierService.getSupplierByIDandName(id, userName);
    }

    @Post('createsupplier')
    @UsePipes(new ValidationPipe())
    createSupplier(@Body() supplierData: SupplierDTO): Promise<SupplierEntity> {
        return this.supplierService.createSupplier(supplierData);
    }

    @Post(':id/products')
    async assignProducts(@Param('id') id: string, @Body('productIds') productIds: number[]) {
        return this.supplierService.assignProducts(Number(id), productIds);
    }

    @Get(':id/products')
    async getProducts(@Param('id') id: string) {
        return this.supplierService.getProducts(Number(id));
    }

    @Delete(':id/products/:productId')
    async removeProduct(@Param('id') id: string, @Param('productId') productId: string) {
        return this.supplierService.removeProduct(Number(id), Number(productId));
    }



    @Put('updatesupplier/:id/:status')
    updateSupplier(
        @Param('id') id: number,
        @Param('status') status: string
    ) {
        return this.supplierService.updateSupplier(id, status);
    }

    @Get('inactivesupplier')
    getInactiveUsers(): Promise<SupplierEntity[]> {

        return this.supplierService.getInactiveSupplier();
    }

    @Put('confirmorder/:id')
    confirmOrder(@Param('id') id: string, @Body('status') status?: string) {
        return this.supplierService.confirmOrder(Number(id), status);
    }

    @Post('scheduledelivery')
    scheduleDelivery(@Body('orderId') orderId: number, @Body('deliveryDate') deliveryDate: string) {
        return this.supplierService.scheduleDelivery(orderId, deliveryDate);
    }

    @Patch(':id')
    @UseInterceptors(FileInterceptor('photo', {
        fileFilter: (req, file, cb) => {
            if (file.originalname.match(/^.*\.(jpg|webp|png|jpeg)$/i)) {
                cb(null, true);
            } else {
                cb(new MulterError('LIMIT_UNEXPECTED_FILE', 'photo'), false);
            }
        },
        limits: { fileSize: 30 * 1024 * 1024 },
        storage: diskStorage({
            destination: './uploads',
            filename: function (req, file, cb) {
                cb(null, Date.now() + file.originalname);
            },
        }),
    }))
    patchSupplier(
        @Param('id') id: string,
        @Body() data: Partial<SupplierDTO>,
        @UploadedFile() file?: Express.Multer.File,
    ) {
        const payload = { ...data };
        if (file?.filename) {
            payload.filename = file.filename;
        }
        return this.supplierService.patchSupplier(Number(id), payload);
    }

    @Post(':id/upload-photo')
    @UseInterceptors(FileInterceptor('photo', {
        fileFilter: (req, file, cb) => {
            if (file.originalname.match(/^.*\.(jpg|webp|png|jpeg)$/i)) {
                cb(null, true);
            } else {
                cb(new MulterError('LIMIT_UNEXPECTED_FILE', 'photo'), false);
            }
        },
        limits: { fileSize: 30 * 1024 * 1024 },
        storage: diskStorage({
            destination: './uploads',
            filename: function (req, file, cb) {
                cb(null, Date.now() + file.originalname);
            },
        }),
    }))
    uploadSupplierPhoto(
        @Param('id') id: string,
        @UploadedFile() file?: Express.Multer.File,
    ) {
        if (!file?.filename) {
            return { error: 'No image uploaded' };
        }
        return this.supplierService.patchSupplier(Number(id), { filename: file.filename });
    }

    @Delete(':id')
    deleteSupplier(@Param('id') id: string) {
        return this.supplierService.deleteSupplier(Number(id));
    }

    @Post('send-email')
    async sendEmail(
        @Body('to') to: string,
        @Body('subject') subject: string,
        @Body('text') text: string,
    ) {
        return this.supplierService.sendEmail(to, subject, text);
    }
}
