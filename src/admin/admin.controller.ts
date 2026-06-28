import { Body, Controller, Get, Param, Post, Put, Query, UsePipes, ValidationPipe } from "@nestjs/common";
import { AdminService } from "./admin.service"
import { AdminDTO } from "./admin.dto";


@Controller('admin')
export class AdminController {
    constructor(private readonly adminService: AdminService) { }
    @Get()
    getAdmin(): string {
        return this.adminService.getAdmin();
    }

    @Get('getalladmin')
    getAllAdmin(): object {
        return this.adminService.getAllAdmin();
    }

    @Get('getadminbyid/:myid/geybyname/:name')
    getAdminByID(@Param('myid') id: number, @Param('name') name: string): object {
        return this.adminService.getAdminByID(id, name);
    }

    @Get('getadminbyidandname')
    getAdminByIDandName(@Query('id') id: number, @Query('name') name: string): object {
        return this.adminService.getAdminByIDandName(id, name);
    }
    @Post('createadmin')
    @UsePipes(new ValidationPipe())
    createAdmin(@Body() adminData: AdminDTO): AdminDTO {
        return this.adminService.createAdmin(adminData);
    }

    @Put('updateadmin/:id')
    @UsePipes(new ValidationPipe())
    updateAdmin(
        @Param('id') id: number,
        @Body() adminData: AdminDTO,
    ): AdminDTO {
        console.log(adminData.name);
        return this.adminService.updateAdmin(id, adminData);
    }

}