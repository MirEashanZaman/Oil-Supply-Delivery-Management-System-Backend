import { Controller, Get, Param, Query, Post, Body, Put, ValidationPipe, UsePipes, UseInterceptors, UploadedFile, Res } from "@nestjs/common";
import { CustomerService } from "./customer.service"
import { CustomerDTO } from "./customer.dto";
import { FileInterceptor } from "@nestjs/platform-express";
import { diskStorage, MulterError } from 'multer';
import type { Response } from 'express';

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
    @UsePipes(new ValidationPipe())
    @UseInterceptors(FileInterceptor('myfile', {
        fileFilter: (req, myfile, cb) => {
            if (myfile.originalname.match(/^.*\.(jpg|webp|png|jpeg)$/))
                cb(null, true);
            else {
                cb(new MulterError('LIMIT_UNEXPECTED_FILE', 'image'), false);
            }
        },
        limits: { fileSize: 30000000 },
        storage: diskStorage({
            destination: './uploads',
            filename: function (req, myfile, cb) {
                cb(null, Date.now() + myfile.originalname)
            },
        })
    }))

    createCustomer(@UploadedFile() file: Express.Multer.File, @Body() customerData: CustomerDTO): CustomerDTO {
        console.log(file?.filename);
        customerData.filename = file?.filename;
        return this.customerService.createCustomer(customerData);
    }

    @Put('updatecustomer/:id') //use for update data like forget password
    updateCustomer(@Param('id') id: number, @Body() customerData: CustomerDTO): CustomerDTO {
        console.log(customerData.name)
        return this.customerService.updateCustomer(id, customerData);
    }

    @Get('/getimage/:name')
    getImages(@Param('name') name: string, @Res() res: Response) {
        res.sendFile(name, { root: './uploads' })
    }

}