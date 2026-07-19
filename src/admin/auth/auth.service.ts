import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AdminService } from '../admin.service';
import { AdminDTO, loginDTO } from '../admin.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
    constructor(
        private adminService: AdminService,
        private jwtService: JwtService
    ) { }
    async signUp(myobj: AdminDTO): Promise<AdminDTO> {
        return await this.adminService.createAdmin(myobj);
    }
    async signIn(logindata: loginDTO): Promise<{ access_token: string }> {
        if (!logindata.email || !logindata.password) {
            throw new UnauthorizedException();
        }
        const user = await this.adminService.findByEmail(logindata.email);
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
