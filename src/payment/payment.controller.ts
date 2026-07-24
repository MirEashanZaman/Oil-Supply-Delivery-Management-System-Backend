import { Controller, Post, Get, Body, Param } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentEntity } from './payment.entity';

@Controller('payment')
export class PaymentController {
    constructor(private readonly paymentService: PaymentService) { }

    @Post('process')
    async processPayment(@Body() paymentData: Partial<PaymentEntity>) {
        return this.paymentService.processPayment(paymentData);
    }

    @Get('status/:id')
    async getPaymentStatus(@Param('id') id: string) {
        return this.paymentService.getPaymentStatus(Number(id));
    }
}
