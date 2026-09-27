import { Injectable, UnauthorizedException, NotFoundException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CustomerService } from '../customer.service';
import { CustomerDTO, loginDTO } from '../customer.dto';
import { jwtConstants } from './constants';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
    constructor(
        private customerService: CustomerService,
        private jwtService: JwtService
    ) { }

    async signUp(myobj: CustomerDTO): Promise<any> {
        return await this.customerService.createCustomer(myobj);
    }

    async signIn(logindata: loginDTO): Promise<{ access_token: string }> {
        if (!logindata.email || !logindata.password) {
            throw new UnauthorizedException();
        }
        const user = await this.customerService.findByEmail(logindata.email);
        if (!user || !user.password) {
            throw new UnauthorizedException();
        }
        const isMatch = await bcrypt.compare(logindata.password, user.password);
        if (!isMatch) {
            throw new UnauthorizedException();
        }
        return {
            access_token: await this.jwtService.signAsync({
                sub: user.id,
                email: user.email,
                role: user.title || 'Customer',
            }),
        };
    }

    async generateStatelessOtp(email: string): Promise<{ resetToken: string; message: string }> {
        const user = await this.customerService.findByEmail(email);
        if (!user) {
            throw new NotFoundException('No registered account found with this email address');
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiryTimestamp = Date.now() + 5 * 60 * 1000;

        const secretKey = `${jwtConstants.secret}:${user.password}`;
        const payload = `${user.email}:${otp}:${expiryTimestamp}`;
        const hmacSignature = crypto.createHmac('sha256', secretKey).update(payload).digest('hex');

        const tokenPayload = `${user.email}:${expiryTimestamp}:${hmacSignature}`;
        const resetToken = Buffer.from(tokenPayload).toString('base64');

        const emailBody = `Hello ${user.username || user.name || 'Valued Customer'},

Your verification OTP for password reset is: ${otp}

This code is valid for 5 minutes only. If you did not request a password reset, please disregard this email.

Best regards,
Oil Supply & Delivery Security Team`;

        await this.customerService.sendEmail(
            user.email,
            'Password Reset Verification Code - Oil Supply & Delivery',
            emailBody
        );

        return {
            resetToken,
            message: 'A 6-digit verification code has been dispatched to your email address.',
        };
    }

    async resetPasswordWithStatelessOtp(email: string, otp: string, resetToken: string, newPassword: string): Promise<{ success: boolean; message: string }> {
        const user = await this.customerService.findByEmail(email);
        if (!user) {
            throw new NotFoundException('Account not found');
        }

        let decodedPayload: string;
        try {
            decodedPayload = Buffer.from(resetToken, 'base64').toString('utf-8');
        } catch {
            throw new BadRequestException('Invalid reset token signature');
        }

        const parts = decodedPayload.split(':');
        if (parts.length !== 3) {
            throw new BadRequestException('Malformed reset token');
        }

        const [tokenEmail, tokenExpiryStr, tokenSignature] = parts;
        const expiryTimestamp = parseInt(tokenExpiryStr, 10);

        if (tokenEmail.toLowerCase() !== email.toLowerCase()) {
            throw new BadRequestException('Token email mismatch');
        }

        if (Date.now() > expiryTimestamp) {
            throw new BadRequestException('Verification OTP has expired. Please request a new code.');
        }

        const secretKey = `${jwtConstants.secret}:${user.password}`;
        const expectedPayload = `${user.email}:${otp.trim()}:${expiryTimestamp}`;
        const expectedSignature = crypto.createHmac('sha256', secretKey).update(expectedPayload).digest('hex');

        const isSignatureValid = crypto.timingSafeEqual(
            Buffer.from(tokenSignature, 'hex'),
            Buffer.from(expectedSignature, 'hex')
        );

        if (!isSignatureValid) {
            throw new BadRequestException('Invalid OTP entered. Please verify the code and try again.');
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        await this.customerService.patchCustomer(user.id, { password: hashedPassword });

        return {
            success: true,
            message: 'Password successfully updated. You can now login with your new credentials.',
        };
    }
}
