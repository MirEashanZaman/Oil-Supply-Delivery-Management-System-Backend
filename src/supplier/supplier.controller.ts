import { Controller, Get, Param, Query } from "@nestjs/common";
import { SupplierService } from "./supplier.service"

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
    getSupplierByID(@Param('myid') id: number, @Param('name') name: string): object {
        return this.supplierService.getSupplierByID(id, name);
    }

    @Get('getsupplierbyidandname')
    getSupplierByIDandName(@Query('id') id: number, @Query('name') name: string): object {
        return this.supplierService.getSupplierByIDandName(id, name);
    }

}