import { Body, Controller, Post, UsePipes, UseInterceptors, UploadedFile, ValidationPipe, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AdminDTO, loginDTO } from '../admin.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { MulterError, diskStorage } from 'multer';
import * as express from 'express';
import * as bcrypt from 'bcrypt';

@Controller('admin/auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @Post('register')
    @UseInterceptors(FileInterceptor('nidImage',
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
    async addUser(@Body() myobj: AdminDTO, @UploadedFile() myfile: Express.Multer.File): Promise<AdminDTO> {
        if (!myobj.password) {
            myobj.password = "";
        }
        const salt = await bcrypt.genSalt();
        const hashedpassword = await bcrypt.hash(myobj.password, salt);
        myobj.password = hashedpassword;
        myobj.filename = myfile.filename;
        return this.authService.signUp(myobj);
    }

    @Post('signIn')
    async signIn(
        @Body() logindata: loginDTO,
        @Res({ passthrough: true }) res: express.Response,
    ) {
        const result = await this.authService.signIn(logindata);

        res.cookie("access_token", result.access_token, {
            httpOnly: true,
            sameSite: "none",
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
