import { Body, Controller, Post, UsePipes, UseInterceptors, UploadedFile, ValidationPipe, Res, BadRequestException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AdminDTO, loginDTO } from '../admin.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import * as express from 'express';
import * as bcrypt from 'bcrypt';
import { createSecureUploadOptions } from '../../common/upload-security';

@Controller('admin/auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @Post('register')
    @UseInterceptors(FileInterceptor('photo', createSecureUploadOptions('photo', 10 * 1024 * 1024)))
    @UsePipes(new ValidationPipe)
    async addUser(@Body() myobj: AdminDTO, @UploadedFile() file: Express.Multer.File): Promise<AdminDTO> {
        if (!file?.filename) {
            throw new BadRequestException('Photo is required during registration');
        }
        if (!myobj.password) {
            myobj.password = "";
        }
        const salt = await bcrypt.genSalt();
        const hashedpassword = await bcrypt.hash(myobj.password, salt);
        const admin = myobj as AdminDTO & { username?: string; filename?: string };
        admin.username = admin.userName;
        admin.filename = file?.filename;
        admin.password = hashedpassword;
        admin.title = 'Admin';
        return this.authService.signUp(admin);
    }

    @Post('signIn')
    async signIn(
        @Body() logindata: loginDTO,
        @Res({ passthrough: true }) res: express.Response,
    ) {
        const result = await this.authService.signIn(logindata);

        const isProd = process.env.NODE_ENV === 'production';
        res.cookie("access_token", result.access_token, {
            httpOnly: true,
            sameSite: isProd ? "none" : "lax",
            secure: isProd,
            path: "/",
            maxAge: 30 * 60 * 1000,
        });
        return { message: 'Login successful', access_token: result.access_token };
    }
}
