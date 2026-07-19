import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { SupplierService } from '../supplier.service';
import { SupplierDTO, loginDTO } from '../supplier.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
    constructor(
        private supplierService: SupplierService,
        private jwtService: JwtService
    ) { }
    async signUp(myobj: SupplierDTO): Promise<any> {
        return await this.supplierService.createSupplier(myobj);
    }
    async signIn(logindata: loginDTO): Promise<{ access_token: string }> {
        if (!logindata.email || !logindata.password) {
            throw new UnauthorizedException();
        }
        const user = await this.supplierService.findByEmail(logindata.email);
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
