import { Controller, Get, Param, Query } from "@nestjs/common";
import { AdminService } from "./admin.service"

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

}