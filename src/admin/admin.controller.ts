import { Body, Controller, Get, Param, Post, Put, Patch, Delete, Query, UsePipes, ValidationPipe } from "@nestjs/common";
import { AdminService } from "./admin.service";
import { AdminDTO } from "./admin.dto";
import { AdminEntity } from "./admin.entity";
 
@Controller('admin')
export class AdminController {
    constructor(private readonly adminService: AdminService) { }
 
    @Get()
    getAdmin(): string {
        return this.adminService.getAdmin();
    }
 
    @Get('getalladmin')
    getAllAdmin(): Promise<AdminEntity[]> {
        return this.adminService.getAllAdmin();
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
 
 
    @Put('updatecountry/:id')
    @UsePipes(new ValidationPipe())
    updateCountry(
        @Param('id') id: string,
        @Body('country') country: string,
    ): Promise<any> {
        return this.adminService.updateCountry(Number(id), country);
    }
 
 
    @Get('joiningdate')
    getByJoiningDate(@Query('date') date: string): Promise<AdminEntity[]> {
        return this.adminService.getByJoiningDate(date);
    }
 
 
    @Get('unknowncountry')
    getUnknownCountryUsers(): Promise<AdminEntity[]> {
        return this.adminService.getUnknownCountryUsers();
    }

    @Get('monitor-data')
    monitorData() {
        return this.adminService.monitorData();
    }

    @Patch(':id')
    patchAdmin(@Param('id') id: string, @Body() data: Partial<AdminDTO>) {
        return this.adminService.patchAdmin(Number(id), data);
    }

    @Delete(':id')
    deleteAdmin(@Param('id') id: string) {
        return this.adminService.deleteAdmin(Number(id));
    }
}