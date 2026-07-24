import { Controller, Get, Param, Query, Body, Post, UsePipes, ValidationPipe, Put, Patch, Delete } from "@nestjs/common";
import { SupplierService } from "./supplier.service"
import { SupplierDTO } from "./supplier.dto";
import { SupplierEntity } from "./supplier.entity";

@Controller('supplier')
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
    getSupplierByID(@Param('myid') id: number, @Param('fullname') fullname: string): object {
        return this.supplierService.getSupplierByID(id, fullname);
    }

    @Get('getsupplierbyidandname')
    getSupplierByIDandName(@Query('id') id: number, @Query('fullname') fullname: string): object {
        return this.supplierService.getSupplierByIDandName(id, fullname);
    }

    @Post('createsupplier')
    @UsePipes(new ValidationPipe())

    createSupplier(

        @Body() supplierData: SupplierDTO,): Promise<SupplierEntity> {

        console.log("Received Body:", supplierData);
        return this.supplierService.createSupplier(supplierData);
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

    @Get('olderthan40')
    getSupplierOld40(): Promise<SupplierEntity[]> {

        return this.supplierService.getSupplierOld40();
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
    patchSupplier(@Param('id') id: string, @Body() data: Partial<SupplierDTO>) {
        return this.supplierService.patchSupplier(Number(id), data);
    }

    @Delete(':id')
    deleteSupplier(@Param('id') id: string) {
        return this.supplierService.deleteSupplier(Number(id));
    }
}
