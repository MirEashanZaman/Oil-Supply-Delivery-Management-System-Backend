import {
    Body,
    Controller,
    Post,
    Get,
    Param,
    UsePipes,
    UseInterceptors,
    UploadedFile,
    ValidationPipe,
    Res,
} from '@nestjs/common';
import { DeliverymanAuthService } from './auth.service';
import { DeliverymanDTO, loginDTO } from '../deliveryman.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import * as bcrypt from 'bcrypt';
import { createSecureUploadOptions } from '../../common/upload-security';

@Controller('deliveryman/auth')
export class DeliverymanAuthController {
    constructor(private authService: DeliverymanAuthService) { }

    @Post('register')
    @UseInterceptors(FileInterceptor('photo', createSecureUploadOptions('photo', 10 * 1024 * 1024)))
    @UsePipes(new ValidationPipe())
    async addUser(
        @Body() myobj: DeliverymanDTO,
        @UploadedFile() myfile?: Express.Multer.File,
    ): Promise<DeliverymanDTO> {
        if (!myobj.password) {
            myobj.password = '';
        }
        const salt = await bcrypt.genSalt();
        const hashedpassword = await bcrypt.hash(myobj.password, salt);
        const deliveryman = myobj as DeliverymanDTO & { filename?: string; title?: string };
        deliveryman.password = hashedpassword;
        deliveryman.filename = myfile?.filename;
        deliveryman.title = 'Deliveryman';
        return this.authService.signUp(deliveryman);
    }

    @Post('signIn')
    async signIn(
        @Body() logindata: loginDTO,
        @Res({ passthrough: true }) res: Response,
    ) {
        const result = await this.authService.signIn(logindata);
        const isProd = process.env.NODE_ENV === 'production';
        res.cookie('access_token', result.access_token, {
            httpOnly: true,
            sameSite: isProd ? 'none' : 'lax',
            secure: isProd,
            path: '/',
            maxAge: 30 * 60 * 1000,
        });
        return { message: 'Login successful', access_token: result.access_token };
    }

    @Get('getimage/:name')
    getImages(@Param('name') name: string, @Res() res: Response) {
        res.sendFile(name, { root: './uploads' });
    }
}
