import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { jwtConstants } from './constants';
import { SupplierModule } from '../supplier.module';

@Module({
    imports: [
        SupplierModule,
        JwtModule.register({
            secret: jwtConstants.secret,
            signOptions: { expiresIn: '30m' },
        }),
    ],
    providers: [AuthService],
    controllers: [AuthController],
    exports: [AuthService],
})
export class AuthModule { }
