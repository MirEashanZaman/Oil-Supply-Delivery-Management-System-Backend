import { Module, forwardRef } from '@nestjs/common';
import { DeliverymanAuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { DeliverymanAuthController } from './auth.controller';
import { jwtConstants } from '../../customer/auth/constants';
import { DeliverymanModule } from '../deliveryman.module';

@Module({
    imports: [
        forwardRef(() => DeliverymanModule),
        JwtModule.register({
            global: true,
            secret: jwtConstants.secret,
            signOptions: { expiresIn: '30m' },
        }),
    ],
    providers: [DeliverymanAuthService],
    controllers: [DeliverymanAuthController],
    exports: [DeliverymanAuthService],
})
export class DeliverymanAuthModule { }
