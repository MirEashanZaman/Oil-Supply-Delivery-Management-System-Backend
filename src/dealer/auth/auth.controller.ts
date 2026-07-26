import { Body, Controller, Post, UsePipes, UseInterceptors, UploadedFile, ValidationPipe, Res, BadRequestException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { DealerDTO, loginDTO } from '../dealer.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { MulterError, diskStorage } from 'multer';
import * as express from 'express';
import * as bcrypt from 'bcrypt';

@Controller('dealer/auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @Post('register')
    @UseInterceptors(FileInterceptor('photo',
        {
            fileFilter: (req, file, cb) => {
                if (file.originalname.match(/^.*\.(jpg|webp|png|jpeg)$/))
                    cb(null, true);
                else {
                    cb(new MulterError('LIMIT_UNEXPECTED_FILE', 'image'), false);
                }
            },
            limits: { fileSize: 30000000 },
            storage: diskStorage({
                destination: './uploads',
                filename: function (req, file, cb) {
                    cb(null, Date.now() + file.originalname)
                },
            })
        }
    ))
    @UsePipes(new ValidationPipe)
    async addUser(@Body() myobj: DealerDTO, @UploadedFile() file: Express.Multer.File): Promise<any> {
        if (!file?.filename) {
            throw new BadRequestException('Photo is required during registration');
        }
        if (!myobj.password) {
            myobj.password = "";
        }
        const salt = await bcrypt.genSalt();
        const hashedpassword = await bcrypt.hash(myobj.password, salt);
        const dealer = myobj as DealerDTO & { username?: string; filename?: string };
        dealer.username = dealer.userName;
        dealer.filename = file?.filename;
        dealer.password = hashedpassword;
        dealer.title = 'Dealer';
        return this.authService.signUp(dealer);
    }

    @Post('signIn')
    async signIn(
        @Body() logindata: loginDTO,
        @Res({ passthrough: true }) res: express.Response,
    ) {
        const result = await this.authService.signIn(logindata);

        res.cookie("access_token", result.access_token, {
            httpOnly: true,
            sameSite: "lax",
            secure: false,
            path: "/",
            maxAge: 300 * 60 * 1000,
        });
        return {
            message: 'Login successful',
            user: result,
        };
    }
}
