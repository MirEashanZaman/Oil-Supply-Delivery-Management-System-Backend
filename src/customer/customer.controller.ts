import { Controller, Get, Param, Query, Post, Body, Put, Patch, ValidationPipe, UsePipes, UseInterceptors, UploadedFile, Res, Delete, UseGuards } from "@nestjs/common";
import { CustomerService } from "./customer.service"
import { CustomerDTO } from "./customer.dto";
import { FileInterceptor } from "@nestjs/platform-express";
import { diskStorage, MulterError } from 'multer';
import type { Response } from 'express';
import { CustomerEntity } from "./customer.entity";
import { AuthGuard } from "./auth/auth.guard";

@Controller('customer')
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
    @UseInterceptors(FileInterceptor('nidImage', {
        fileFilter: (req, nidImage, cb) => {
            if (nidImage.originalname.match(/^.*\.(jpg|webp|png|jpeg)$/))
                cb(null, true);
            else {
                cb(new MulterError('LIMIT_UNEXPECTED_FILE', 'image'), false);
            }
        },
        limits: { fileSize: 2 * 1024 * 1024 },
        storage: diskStorage({
            destination: './uploads',
            filename: function (req, nidImage, cb) {
                cb(null, Date.now() + nidImage.originalname)
            },
        })
    }))

    createCustomer(@UploadedFile() file: Express.Multer.File, @Body() customerData: CustomerDTO): Promise<CustomerEntity> {
        console.log(file?.filename);
        customerData.filename = file?.filename;
        return this.customerService.createCustomer(customerData);
    }

    @Put('updatecustomer/:id') //use for update data like forget password
    updateCustomer(@Param('id') id: string, @Body() customerData: CustomerDTO): CustomerDTO {
        console.log(customerData.username)
        return this.customerService.updateCustomer(Number(id), customerData);
    }

    @Get('/getimage/:name')
    getImages(@Param('name') name: string, @Res() res: Response) {
        res.sendFile(name, { root: './uploads' })
    }

    @Get('search')
    findByFullName(@Query('fullName') fullName: string) {
        return this.customerService.findByFullNameSubstring(fullName);
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

    @Patch(':id')
    patchCustomer(@Param('id') id: string, @Body() data: Partial<CustomerDTO>) {
        return this.customerService.patchCustomer(Number(id), data);
    }
}