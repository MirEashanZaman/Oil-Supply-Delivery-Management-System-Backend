import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { DeliverymanService } from '../deliveryman.service';
import { DeliverymanDTO, loginDTO } from '../deliveryman.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class DeliverymanAuthService {
    constructor(
        private deliverymanService: DeliverymanService,
        private jwtService: JwtService,
    ) { }

    async signUp(myobj: DeliverymanDTO): Promise<any> {
        return await this.deliverymanService.createDeliveryman(myobj);
    }

    async signIn(logindata: loginDTO): Promise<{ access_token: string }> {
        if (!logindata.email || !logindata.password) {
            throw new UnauthorizedException();
        }
        const user = await this.deliverymanService.findByEmail(logindata.email);
        if (!user || !user.password) {
            throw new UnauthorizedException();
        }
        const isMatch = await bcrypt.compare(logindata.password, user.password);
        if (!isMatch) {
            throw new UnauthorizedException('Invalid email or password');
        }
        if (user.status === 'pending_approval') {
            throw new UnauthorizedException('Your deliveryman registration is pending admin approval. Please wait for an administrator to activate your account.');
        }
        if (user.status === 'inactive') {
            throw new UnauthorizedException('Your deliveryman account has been deactivated. Please contact an administrator.');
        }
        return {
            access_token: await this.jwtService.signAsync({
                sub: user.id,
                email: user.email,
                role: user.title || 'Deliveryman',
            }),
        };
    }
}
