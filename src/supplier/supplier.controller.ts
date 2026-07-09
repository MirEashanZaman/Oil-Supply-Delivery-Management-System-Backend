import { Controller, Get, Param, Query, Body, Post, UploadedFile, UseInterceptors, UsePipes, ValidationPipe, Res, Put } from "@nestjs/common";
import { SupplierService } from "./supplier.service"
import { SupplierDTO } from "./supplier.dto";
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage, MulterError } from 'multer';
import type { Response } from 'express';
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
    getSupplierByID(@Param('myid') id: number, @Param('name') name: string): object {
        return this.supplierService.getSupplierByID(id, name);
    }

    @Get('getsupplierbyidandname')
    getSupplierByIDandName(@Query('id') id: number, @Query('name') name: string): object {
        return this.supplierService.getSupplierByIDandName(id, name);
    }

    @Post('createsupplier')
    @UsePipes(new ValidationPipe())
    @UseInterceptors(
        FileInterceptor('pdfFile', {
            fileFilter: (req, file, cb) => {
                if (file.originalname.match(/^.*\.(pdf)$/i)) { cb(null, true); }
                else {
                    cb(new MulterError('LIMIT_UNEXPECTED_FILE', 'pdf'), false);
                }
            },
            limits: { fileSize: 5 * 1024 * 1024 },
            storage: diskStorage({
                destination: './uploads',
                filename: (req, file, cb) => {
                    cb(null, Date.now() + '-' + file.originalname);
                },
            }),

        }),


    )
    createSupplier(
        @UploadedFile() file: Express.Multer.File,
        @Body() supplierData: SupplierDTO,): Promise<SupplierEntity> {
        supplierData.filename = file?.filename;
        return this.supplierService.createSupplier(supplierData);
    }

    @Put('updatesupplier/:id') //use for update data
    updateSupplier(@Param('id') id: number, @Body() supplierData: SupplierDTO): SupplierDTO {
        console.log(supplierData.name)
        return this.supplierService.updateSupplier(id, supplierData);
    }

    @Get('/getfile/:name')
    getfile(@Param('name') name: string, @Res() res: Response) {
        res.sendFile(name, { root: './uploads' })
    }

}
