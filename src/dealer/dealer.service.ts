import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Dealer } from './dealer.entity';
import { DealerDTO } from './dealer.dto';

@Injectable()
export class DealerService {
  constructor(
    @InjectRepository(Dealer)
    private dealerRepository: Repository<Dealer>,
  ) {}

  createDealer(dealerData: DealerDTO): Promise<Dealer> {
    const newDealer: Dealer = this.dealerRepository.create({
      ...dealerData,
      phone: dealerData.phone ? Number(dealerData.phone) : undefined,
    });
    return this.dealerRepository.save(newDealer);
  }

  async updatePhone(id: number, dealerData: DealerDTO): Promise<Dealer | null> {
    await this.dealerRepository.update(id, {
      phone: dealerData.phone ? Number(dealerData.phone) : undefined,
    });
    return this.dealerRepository.findOneBy({ id });
  }

  async getDealersWithNoName(): Promise<Dealer[]> {
    return this.dealerRepository.find({
      where: { fullName: IsNull() },
    });
  }

  async deleteDealer(id: number): Promise<void> {
    await this.dealerRepository.delete(id);
  }

  async findByEmail(email: string): Promise<Dealer | null> {
    return await this.dealerRepository.findOneBy({ email });
  }

  async getAllDealers(): Promise<Dealer[]> {
    return this.dealerRepository.find();
  }

  placeOrder(orderData: any) {
    return { order: orderData, status: 'placed', message: 'Order placed by dealer' };
  }

  trackOrderStatus(orderId: number) {
    return { orderId: orderId, status: 'in-transit', message: 'Tracking status retrieved' };
  }
}