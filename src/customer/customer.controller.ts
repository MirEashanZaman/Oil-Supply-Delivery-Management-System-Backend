import { Controller, Get, Param, Query, Post, Body, Put } from "@nestjs/common";
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
    createAdmin(@Body() adminData: CustomerDTO): CustomerDTO {
        console.log(adminData.name)
        return this.customerService.createCustomer(adminData);
    }

    @Put('updatecustomer/:id') //use for update data like forget password
    updateCustomer(@Param('id') id: number, @Body() customerData: CustomerDTO): CustomerDTO {
        console.log(customerData.name)
        return this.customerService.updateCustomer(id, customerData);
    }

}