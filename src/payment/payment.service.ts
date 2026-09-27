import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaymentEntity } from './payment.entity';
import { PaymentStrategyResolver } from '../patterns/strategy/payment-strategy';

@Injectable()
export class PaymentService {
    private strategyResolver: PaymentStrategyResolver;

    constructor(
        @InjectRepository(PaymentEntity)
        private paymentRepo: Repository<PaymentEntity>,
    ) {
        this.strategyResolver = new PaymentStrategyResolver();
    }

    async processPayment(paymentData: Partial<PaymentEntity>) {
        if (paymentData.cardNumber) {
            throw new BadRequestException('Raw card numbers must not be sent to the API. Use a payment token.');
        }

        const strategy = this.strategyResolver.resolve(paymentData.paymentMethod);
        const result = await strategy.pay(Number(paymentData.amount) || 0, {
            paymentMethod: paymentData.paymentMethod || 'card',
            cardType: paymentData.cardType,
            paymentReference: paymentData.paymentReference,
        });

        const payment = this.paymentRepo.create({
            amount: paymentData.amount,
            cardType: paymentData.cardType,
            paymentMethod: paymentData.paymentMethod || strategy.name,
            paymentReference: paymentData.paymentReference || result.transactionId,
            status: paymentData.status || result.gatewayStatus || 'completed',
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
