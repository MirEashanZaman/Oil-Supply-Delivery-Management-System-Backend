import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaymentEntity } from './payment.entity';

@Injectable()
export class PaymentService {
    constructor(
        @InjectRepository(PaymentEntity)
        private paymentRepo: Repository<PaymentEntity>,
    ) { }

    async processPayment(paymentData: Partial<PaymentEntity>) {
        if (paymentData.cardNumber) {
            throw new BadRequestException('Raw card numbers must not be sent to the API. Use a payment token.');
        }

        const payment = this.paymentRepo.create({
            amount: paymentData.amount,
            cardType: paymentData.cardType,
            paymentMethod: paymentData.paymentMethod,
            paymentReference: paymentData.paymentReference,
            status: paymentData.status || 'completed',
        });
        return this.paymentRepo.save(payment);
    }

    async getPaymentStatus(paymentId: number) {
        const payment = await this.paymentRepo.findOneBy({ id: paymentId });
        if (!payment) {
            throw new NotFoundException(`Payment with ID ${paymentId} not found`);
        }
        return payment;
    }
}
