import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { DealerService } from '../dealer.service';
import { DealerDTO, loginDTO } from '../dealer.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
    constructor(
        private dealerService: DealerService,
        private jwtService: JwtService
    ) { }
    async signUp(myobj: DealerDTO): Promise<any> {
        return await this.dealerService.createDealer(myobj);
    }
    async signIn(logindata: loginDTO): Promise<{ access_token: string }> {
        if (!logindata.email || !logindata.password) {
            throw new UnauthorizedException();
        }
        const user = await this.dealerService.findByEmail(logindata.email);
        if (!user || !user.password) {
            throw new UnauthorizedException();
        }
        const isMatch = await bcrypt.compare(logindata.password, user.password);
        if (!isMatch) {
            throw new UnauthorizedException();
        }
        const payload = logindata;
        return {
            access_token: await this.jwtService.signAsync(payload),
        };
    }
}
