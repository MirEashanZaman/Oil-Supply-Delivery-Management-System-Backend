import { Controller, Get, Param, Query, Post, Body } from "@nestjs/common";
import { CustomerService } from "./customer.service"
import { CustomerDTO } from "./customer.dto";

@Controller('customer')
export class CustomerController {
    constructor(private readonly customerService: CustomerService) { }
    @Get()
    getCustomer(): string {
        return this.customerService.getCustomer();
    }

    @Get('getallcustomer')
    getAllCustomer(): object {
        return this.customerService.getAllCustomer();
    }

    @Get('getcustomerbyid/:myid/geybyname/:name')
    getCustomerByID(@Param('myid') id: number, @Param('name') name: string): object {
        return this.customerService.getCustomerByID(id, name);
    }

    @Get('getcustomerbyidandname')
    getCustomerByIDandName(@Query('id') id: number, @Query('name') name: string): object {
        return this.customerService.getCustomerByIDandName(id, name);
    }

    @Post('createcustomer')
    createAdmin(@Body() adminData: CustomerDTO): object {
        console.log(adminData)
        return this.customerService.createCustomer(adminData);
    }

}