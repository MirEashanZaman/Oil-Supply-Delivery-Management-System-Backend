import { Controller, Get, Param, Query } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Get('all')
    async getAllUsers() {
        return this.usersService.getAllUsers();
    }

    @Get('search')
    async searchUser(@Query('email') email: string) {
        return this.usersService.searchUserByEmail(email);
    }

    @Get('search/:email')
    async getUserByEmail(@Param('email') email: string) {
        return this.usersService.searchUserByEmail(email);
    }
}
