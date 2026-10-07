import { Body, Controller, Get, Param, Post, Put, Patch, Delete, Query, UsePipes, ValidationPipe, UseGuards, Req, UseInterceptors, UploadedFile } from "@nestjs/common";
import { AuthGuard } from './auth/auth.guard';
import { AdminService } from "./admin.service";
import { AdminDTO } from "./admin.dto";
import { AdminEntity } from "./admin.entity";
import { CustomerDTO } from "../customer/customer.dto";
import { DealerDTO } from "../dealer/dealer.dto";
import { SupplierDTO } from "../supplier/supplier.dto";
import { DeliverymanDTO } from "../deliveryman/deliveryman.dto";
import { OrderEntity } from "../order/order.entity";
import { Request } from "express";
import { FileInterceptor } from '@nestjs/platform-express';
import { createSecureUploadOptions } from "../common/upload-security";

@UseGuards(AuthGuard)
@Controller('admin')
export class AdminController {
    constructor(private readonly adminService: AdminService) { }

    @Get()
    getAdmin(): string {
        return this.adminService.getAdmin();
    }

    @Get('getallusers')
    getAllUsers(): Promise<any[]> {
        return this.adminService.getAllUsers();
    }

    @Get('getadminbyid/:myid')
    getAdminByID(@Param('myid') id: string): Promise<AdminEntity | null> {
        return this.adminService.getAdminByID(Number(id));
    }

    @Post('createadmin')
    @UsePipes(new ValidationPipe())
    createAdmin(@Body() adminData: AdminDTO): Promise<AdminEntity> {
        return this.adminService.createAdmin(adminData);
    }


    @Get('joiningdate')
    getByJoiningDate(@Query('date') date: string): Promise<any[]> {
        return this.adminService.getByJoiningDate(date);
    }

    @Get('monitor-data')
    monitorData() {
        return this.adminService.monitorData();
    }

    @Patch(':id')
    @UseInterceptors(FileInterceptor('photo', createSecureUploadOptions('photo', 10 * 1024 * 1024)))
    patchAdmin(
        @Param('id') id: string,
        @Body() data: Partial<AdminDTO>,
        @Req() req: Request,
        @UploadedFile() file?: Express.Multer.File,
    ) {
        const payload = { ...data };
        if (file?.filename) {
            payload.filename = file.filename;
        }
        return this.adminService.patchAdmin(Number(id), (req as any).user.email, payload);
    }

    @Post(':id/upload-photo')
    @UseInterceptors(FileInterceptor('photo', createSecureUploadOptions('photo', 10 * 1024 * 1024)))
    uploadAdminPhoto(
        @Param('id') id: string,
        @Req() req: Request,
        @UploadedFile() file?: Express.Multer.File,
    ) {
        if (!file?.filename) {
            return { error: 'No image uploaded' };
        }
        return this.adminService.patchAdmin(Number(id), (req as any).user.email, { filename: file.filename });
    }

    @Delete(':id')
    deleteAdmin(@Param('id') id: string, @Req() req: Request) {
        return this.adminService.deleteAdmin(Number(id), (req as any).user.email);
    }

    @Post('customer')
    @UsePipes(new ValidationPipe())
    createCustomer(@Body() data: CustomerDTO) {
        return this.adminService.adminCreateCustomer(data);
    }

    @Patch('customer/:id')
    updateCustomer(@Param('id') id: string, @Body() data: Partial<CustomerDTO>) {
        return this.adminService.adminUpdateCustomer(Number(id), data);
    }

    @Delete('customer/:id')
    deleteCustomer(@Param('id') id: string) {
        return this.adminService.adminDeleteCustomer(Number(id));
    }

    @Post('dealer')
    @UsePipes(new ValidationPipe())
    createDealer(@Body() data: DealerDTO) {
        return this.adminService.adminCreateDealer(data);
    }

    @Patch('dealer/:id')
    updateDealer(@Param('id') id: string, @Body() data: Partial<DealerDTO>) {
        return this.adminService.adminUpdateDealer(Number(id), data);
    }

    @Delete('dealer/:id')
    deleteDealer(@Param('id') id: string) {
        return this.adminService.adminDeleteDealer(Number(id));
    }

    @Post('supplier')
    @UsePipes(new ValidationPipe())
    createSupplier(@Body() data: SupplierDTO) {
        return this.adminService.adminCreateSupplier(data);
    }

    @Patch('supplier/:id')
    updateSupplier(@Param('id') id: string, @Body() data: Partial<SupplierDTO>) {
        return this.adminService.adminUpdateSupplier(Number(id), data);
    }

    @Delete('supplier/:id')
    deleteSupplier(@Param('id') id: string) {
        return this.adminService.adminDeleteSupplier(Number(id));
    }

    @Post('deliveryman')
    @UsePipes(new ValidationPipe())
    createDeliveryman(@Body() data: DeliverymanDTO) {
        return this.adminService.adminCreateDeliveryman(data);
    }

    @Patch('deliveryman/:id')
    updateDeliveryman(@Param('id') id: string, @Body() data: Partial<DeliverymanDTO>) {
        return this.adminService.adminUpdateDeliveryman(Number(id), data);
    }

    @Put('deliveryman/:id/approve')
    approveDeliveryman(@Param('id') id: string) {
        return this.adminService.adminApproveDeliveryman(Number(id));
    }

    @Delete('deliveryman/:id')
    deleteDeliveryman(@Param('id') id: string) {
        return this.adminService.adminDeleteDeliveryman(Number(id));
    }

    @Patch('order/:id')
    updateOrder(@Param('id') id: string, @Body() data: Partial<OrderEntity>) {
        return this.adminService.adminUpdateOrder(Number(id), data);
    }

    @Delete('order/:id')
    deleteOrder(@Param('id') id: string) {
        return this.adminService.adminDeleteOrder(Number(id));
    }

    @Post('send-email')
    async sendEmail(
        @Body('to') to: string,
        @Body('subject') subject: string,
        @Body('text') text: string,
    ) {
        return this.adminService.sendEmail(to, subject, text);
    }
}