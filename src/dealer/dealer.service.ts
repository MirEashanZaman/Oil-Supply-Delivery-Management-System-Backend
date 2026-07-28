import { Injectable, NotFoundException, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Dealer } from './dealer.entity';
import { DealerDTO } from './dealer.dto';
import { MailerService } from '@nestjs-modules/mailer';
import { Product } from '../product/product.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class DealerService {
  constructor(
    @InjectRepository(Dealer)
    private dealerRepository: Repository<Dealer>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    private mailerService: MailerService,
  ) { }

  async sendEmail(to: string, subject: string, text: string) {
    return await this.mailerService.sendMail({
      to: to,
      subject: subject,
      text: text,
    });
  }

  async createDealer(dealerData: DealerDTO): Promise<Dealer> {
    const existing = await this.dealerRepository.findOneBy({ email: dealerData.email as string });
    if (existing) {
      throw new HttpException('Dealer already exists', HttpStatus.CONFLICT);
    }

    const isHashed = dealerData.password && /^\$2[aby]\$\d{2}\$/.test(dealerData.password);
    const hashedPassword = dealerData.password
      ? (isHashed ? dealerData.password : await bcrypt.hash(dealerData.password, 10))
      : undefined;
    const newDealer: Dealer = this.dealerRepository.create({
      ...dealerData,
      password: hashedPassword,
    });
    return this.dealerRepository.save(newDealer);
  }

  async updatePhone(id: number, dealerData: DealerDTO): Promise<Dealer | null> {
    await this.dealerRepository.update(id, {
      phoneNumber: dealerData.phoneNumber,
    });
    return this.dealerRepository.findOneBy({ id });
  }

  async getDealersWithNoName(): Promise<Dealer[]> {
    return this.dealerRepository.find({
      where: { userName: IsNull() },
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

  async patchDealer(id: number, data: Partial<DealerDTO>): Promise<Dealer | null> {
    await this.dealerRepository.update(id, data as any);
    return this.dealerRepository.findOneBy({ id });
  }

  async assignProducts(dealerId: number, productIds: number[]): Promise<Dealer> {
    const dealer = await this.dealerRepository.findOne({ where: { id: dealerId }, relations: { products: true } });
    if (!dealer) throw new NotFoundException('Dealer not found');
    const products = await this.productRepository.createQueryBuilder('product').where('product.id IN (:...ids)', { ids: productIds }).getMany();
    dealer.products = [...(dealer.products || []), ...products];
    return this.dealerRepository.save(dealer);
  }

  async getProducts(dealerId: number): Promise<Product[]> {
    const dealer = await this.dealerRepository.findOne({ where: { id: dealerId }, relations: { products: true } });
    if (!dealer) throw new NotFoundException('Dealer not found');
    return dealer.products || [];
  }

  async removeProduct(dealerId: number, productId: number): Promise<void> {
    const dealer = await this.dealerRepository.findOne({ where: { id: dealerId }, relations: { products: true } });
    if (!dealer) throw new NotFoundException('Dealer not found');
    dealer.products = (dealer.products || []).filter(p => p.id !== productId);
    await this.dealerRepository.save(dealer);
  }
}