import { Body, Controller, Get, Param, Post, Put, Patch, Delete, Query, UsePipes, ValidationPipe, UseGuards, Req } from "@nestjs/common";
import { AuthGuard } from './auth/auth.guard';
import { AdminService } from "./admin.service";
import { AdminDTO } from "./admin.dto";
import { AdminEntity } from "./admin.entity";
import { CustomerDTO } from "../customer/customer.dto";
import { DealerDTO } from "../dealer/dealer.dto";
import { SupplierDTO } from "../supplier/supplier.dto";
import { OrderEntity } from "../order/order.entity";
import { Request } from "express";

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
    patchAdmin(@Param('id') id: string, @Body() data: Partial<AdminDTO>, @Req() req: Request) {
        return this.adminService.patchAdmin(Number(id), req['user'].email, data);
    }

    @Delete(':id')
    deleteAdmin(@Param('id') id: string, @Req() req: Request) {
        return this.adminService.deleteAdmin(Number(id), req['user'].email);
    }

    // Manage Customers
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

    // Manage Dealers
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

    // Manage Suppliers
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

    // Manage Orders (Update & Delete only)
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