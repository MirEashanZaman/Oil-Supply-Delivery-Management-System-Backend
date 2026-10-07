import { Controller, Get, Param, Query, Post, Body, Put, Patch, ValidationPipe, UsePipes, UseInterceptors, UploadedFile, Res, Delete, UseGuards } from "@nestjs/common";
import { CustomerService } from "./customer.service"
import { CustomerDTO } from "./customer.dto";
import { FileInterceptor } from "@nestjs/platform-express";
import type { Response } from 'express';
import { CustomerEntity } from "./customer.entity";
import { AuthGuard } from "./auth/auth.guard";
import { createSecureUploadOptions } from "../common/upload-security";

@Controller('customer')
@UseGuards(AuthGuard)
export class CustomerController {
    constructor(private readonly customerService: CustomerService) { }

    @Get()
    getCustomer(): string {
        return this.customerService.getCustomer();
    }


    @Get('getallcustomer')
    getAllCustomer(): Promise<any> {
        return this.customerService.getAllCustomer();
    }

    @Get('getcustomerbyid/:myid')
    getCustomerByID(@Param('myid') id: string): Promise<any> {
        return this.customerService.getCustomerByID(Number(id));
    }

    @Get('getcustomerbyidandname')
    getCustomerByIDandName(@Query('id') id: string, @Query('name') name: string): object {
        return this.customerService.getCustomerByIDandName(Number(id), name);
    }

    @Post('createcustomer')
    @UsePipes(new ValidationPipe())
    @UseInterceptors(FileInterceptor('Image', createSecureUploadOptions('image', 5 * 1024 * 1024)))
    createCustomer(@UploadedFile() file: Express.Multer.File, @Body() customerData: CustomerDTO): Promise<CustomerEntity> {
        console.log(file?.filename);
        const customer = customerData as CustomerDTO & { username?: string; filename?: string };
        customer.username = customer.userName;
        customer.filename = file?.filename;
        return this.customerService.createCustomer(customer);
    }

    @Post(':id/orders')
    async createOrder(@Param('id') id: string, @Body() orderData: any) {
        return this.customerService.createOrder(id, orderData);
    }

    @Get(':id/orders')
    async getOrdersByCustomer(@Param('id') id: string) {
        return this.customerService.getOrdersByCustomerId(id);
    }

    @Delete(':id/orders/:orderId')
    async deleteOrder(@Param('id') id: string, @Param('orderId') orderId: string) {
        return this.customerService.deleteOrder(id, orderId);
    }

    @Put('updatecustomer/:id') //use for update data like forget password
    updateCustomer(@Param('id') id: string, @Body() customerData: CustomerDTO): CustomerDTO {
        console.log(customerData.userName)
        return this.customerService.updateCustomer(Number(id), customerData);
    }

    @Get('/getimage/:name')
    getImages(@Param('name') name: string, @Res() res: Response) {
        res.sendFile(name, { root: './uploads' })
    }

    @Get('search')
    findByUserName(@Query('userName') userName: string) {
        return this.customerService.findByUserNameSubstring(userName);
    }

    @Get(':username')
    findByUsername(@Param('username') username: string) {
        return this.customerService.findByUsername(username);
    }

    @Delete(':username')
    deleteByUsername(@Param('username') username: string) {
        return this.customerService.deleteByUsername(username);
    }

    @Get('trackorder/:id')
    trackOrderStatus(@Param('id') id: string) {
        return this.customerService.trackOrderStatus(Number(id));
    }

    @Put('confirmorder/:id')
    confirmOrder(@Param('id') id: string, @Body('status') status?: string) {
        return this.customerService.confirmOrder(Number(id), status);
    }

    @Patch(':id')
    @UseInterceptors(FileInterceptor('photo', createSecureUploadOptions('photo', 10 * 1024 * 1024)))
    patchCustomer(
        @Param('id') id: string,
        @Body() data: Partial<CustomerDTO>,
        @UploadedFile() file?: Express.Multer.File,
    ) {
        const payload = { ...data };
        if (file?.filename) {
            payload.filename = file.filename;
        }
        return this.customerService.patchCustomer(Number(id), payload);
    }

    @Post(':id/upload-photo')
    @UseInterceptors(FileInterceptor('photo', createSecureUploadOptions('photo', 10 * 1024 * 1024)))
    uploadCustomerPhoto(
        @Param('id') id: string,
        @UploadedFile() file?: Express.Multer.File,
    ) {
        if (!file?.filename) {
            return { error: 'No image uploaded' };
        }
        return this.customerService.patchCustomer(Number(id), { filename: file.filename });
    }

    @Post('send-email')
    async sendEmail(
        @Body('to') to: string,
        @Body('subject') subject: string,
        @Body('text') text: string,
    ) {
        return this.customerService.sendEmail(to, subject, text);
    }

    @Get('partners/nearby')
    async getNearbyPartners(
        @Query('address') address?: string,
        @Query('radius') radius?: string,
    ) {
        const radiusKm = radius ? Math.max(5, Number(radius)) : 50;
        return this.customerService.findNearbySuppliersAndDealers(address, radiusKm);
    }
}