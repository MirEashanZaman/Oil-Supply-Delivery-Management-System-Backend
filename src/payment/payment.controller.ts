import { Controller, Post, Get, Body, Param, UseGuards } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentEntity } from './payment.entity';
import { AuthGuard } from '../customer/auth/auth.guard';

@Controller('payment')
export class PaymentController {
    constructor(private readonly paymentService: PaymentService) { }

    @Post('process')
    @UseGuards(AuthGuard)
    async processPayment(@Body() paymentData: Partial<PaymentEntity>) {
        return this.paymentService.processPayment(paymentData);
    }

    @Get('status/:id')
    async getPaymentStatus(@Param('id') id: string) {
        return this.paymentService.getPaymentStatus(Number(id));
    }
}
