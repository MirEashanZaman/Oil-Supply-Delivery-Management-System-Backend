import { Body, Controller, Post, Get, Param, UsePipes, UseInterceptors, UploadedFile, ValidationPipe, Res, BadRequestException, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CustomerDTO, loginDTO } from '../customer.dto';
import { ForgotPasswordRequestDto, ResetPasswordWithOtpDto } from '../dto/forgot-password.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import * as express from 'express';
import * as bcrypt from 'bcrypt';
import { RedisThrottlerGuard, RateLimit } from '../../redis/redis-throttler.guard';
import { createSecureUploadOptions } from '../../common/upload-security';

@Controller('customer/auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @Post('register')
    @UseGuards(RedisThrottlerGuard)
    @RateLimit({ limit: 5, ttlSeconds: 60, keyPrefix: 'brute_force_register' })
    @UseInterceptors(FileInterceptor('photo', createSecureUploadOptions('photo', 10 * 1024 * 1024)))
    @UsePipes(new ValidationPipe)
    async addUser(@Body() myobj: CustomerDTO, @UploadedFile() myfile: Express.Multer.File): Promise<CustomerDTO> {
        if (!myfile?.filename) {
            throw new BadRequestException('Photo is required during registration');
        }
        if (!myobj.password) {
            myobj.password = "";
        }
        const salt = await bcrypt.genSalt();
        const hashedpassword = await bcrypt.hash(myobj.password, salt);
        const customer = myobj as CustomerDTO & { username?: string; filename?: string };
        customer.username = customer.userName;
        customer.password = hashedpassword;
        customer.filename = myfile.filename;
        customer.title = 'Customer';
        return this.authService.signUp(customer);
    }

    @Post('signIn')
    @UseGuards(RedisThrottlerGuard)
    @RateLimit({ limit: 5, ttlSeconds: 60, keyPrefix: 'brute_force_login' })
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

    @Post('forgot-password')
    @UseGuards(RedisThrottlerGuard)
    @RateLimit({ limit: 3, ttlSeconds: 60, keyPrefix: 'brute_force_otp_req' })
    @UsePipes(new ValidationPipe({ whitelist: true }))
    async forgotPassword(@Body() body: ForgotPasswordRequestDto) {
        return this.authService.generateStatelessOtp(body.email);
    }

    @Post('reset-password')
    @UseGuards(RedisThrottlerGuard)
    @RateLimit({ limit: 5, ttlSeconds: 60, keyPrefix: 'brute_force_otp_verify' })
    @UsePipes(new ValidationPipe({ whitelist: true }))
    async resetPassword(@Body() body: ResetPasswordWithOtpDto) {
        return this.authService.resetPasswordWithStatelessOtp(
            body.email,
            body.otp,
            body.resetToken,
            body.newPassword
        );
    }

    @Get('getimage/:name')
    getImages(@Param('name') name: string, @Res() res: express.Response) {
        res.sendFile(name, { root: './uploads' });
    }
}