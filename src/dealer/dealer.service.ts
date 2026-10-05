import { Injectable, NotFoundException, BadRequestException, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Dealer } from './dealer.entity';
import { DealerDTO } from './dealer.dto';
import { MailerService } from '@nestjs-modules/mailer';
import { Product } from '../product/product.entity';
import { OrderEntity } from '../order/order.entity';
import { SupplierEntity } from '../supplier/supplier.entity';
import { DeliveryEntity } from '../delivery/delivery.entity';
import { GeoProximityService, PartnerLocation } from '../patterns/geo/geo-proximity.service';
import * as bcrypt from 'bcrypt';
import { RedisService } from '../redis/redis.service';
import { RabbitMQService } from '../rabbitmq/rabbitmq.service';

@Injectable()
export class DealerService {
  constructor(
    @InjectRepository(Dealer)
    private dealerRepository: Repository<Dealer>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(OrderEntity)
    private orderRepository: Repository<OrderEntity>,
    @InjectRepository(SupplierEntity)
    private supplierRepository: Repository<SupplierEntity>,
    @InjectRepository(DeliveryEntity)
    private deliveryRepository: Repository<DeliveryEntity>,
    private mailerService: MailerService,
    private rabbitMQService: RabbitMQService,
    private redisService: RedisService,
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
    const saved = await this.dealerRepository.save(newDealer);
    try {
      await this.redisService.del('dealers:all');
    } catch {}
    return saved;
  }

  async updatePhone(id: number, dealerData: DealerDTO): Promise<Dealer | null> {
    await this.dealerRepository.update(id, {
      phoneNumber: dealerData.phoneNumber,
    });
    const updated = await this.dealerRepository.findOneBy({ id });
    try {
      await this.redisService.del('dealers:all');
      if (updated?.email) await this.redisService.del(`dealer:email:${updated.email}`);
    } catch {}
    return updated;
  }

  async getDealersWithNoName(): Promise<Dealer[]> {
    return this.dealerRepository.find({
      where: { userName: IsNull() },
    });
  }

  async deleteDealer(id: number): Promise<void> {
    const dealer = await this.dealerRepository.findOneBy({ id });
    await this.dealerRepository.delete(id);
    try {
      await this.redisService.del('dealers:all');
      if (dealer?.email) await this.redisService.del(`dealer:email:${dealer.email}`);
    } catch {}
  }

  async findByEmail(email: string): Promise<Dealer | null> {
    const cacheKey = `dealer:email:${email}`;
    try {
      const cached = await this.redisService.get(cacheKey);
      if (cached) return JSON.parse(cached);
    } catch {}

    const dealer = await this.dealerRepository.findOneBy({ email });
    if (dealer) {
      try {
        await this.redisService.set(cacheKey, JSON.stringify(dealer), 60);
      } catch {}
    }
    return dealer;
  }

  async getAllDealers(): Promise<Dealer[]> {
    const cacheKey = 'dealers:all';
    try {
      const cached = await this.redisService.get(cacheKey);
      if (cached) return JSON.parse(cached);
    } catch {}

    const dealers = await this.dealerRepository.find();
    try {
      await this.redisService.set(cacheKey, JSON.stringify(dealers), 60);
    } catch {}
    return dealers;
  }

  async placeOrder(orderData: any, dealerEmail: string): Promise<any> {
    const dealer = await this.findByEmail(dealerEmail);
    if (!dealer) throw new NotFoundException('Dealer not found');

    let product: Product | null = null;
    const requestedQty = Number(orderData.quantity) || 1;
    if (orderData.productId) {
      product = await this.productRepository.findOneBy({ id: orderData.productId });
      if (!product) throw new NotFoundException('Product not found');
      if (!product.quantity || product.quantity <= 0 || product.quantity < requestedQty) {
        throw new BadRequestException('Not enough stock');
      }
      product.quantity = product.quantity - requestedQty;
      await this.productRepository.save(product);
    }

    let supplier: SupplierEntity | null = null;
    if (orderData.supplierId) {
      supplier = await this.supplierRepository.findOneBy({ id: orderData.supplierId });
      if (!supplier) throw new NotFoundException('Supplier not found');
    }

    const order = this.orderRepository.create({
      quantity: requestedQty,
      sourceType: orderData.sourceType || 'dealer',
      supplierId: supplier?.id ?? orderData.supplierId ?? undefined,
      dealerId: dealer.id,
      product: product || undefined,
      dealer: dealer,
      supplier: supplier || undefined,
      status: 'pending',
    });

    const saved = await this.orderRepository.save(order);

    if (this.rabbitMQService && typeof this.rabbitMQService.sendMessage === 'function') {
      await this.rabbitMQService.sendMessage(
        'order_notifications_queue',
        'order.wholesale.created',
        {
          orderId: saved.id,
          productName: product?.name || 'Wholesale Petroleum Lot',
          quantity: requestedQty,
          dealerEmail: dealer.email,
          supplierId: supplier?.id,
          timestamp: new Date().toISOString(),
        },
        dealer.userName || dealer.email,
        'Supplier Wholesale Desk'
      );
    }

    return saved;
  }

  trackOrderStatus(orderId: number) {
    return { orderId: orderId, status: 'in-transit', message: 'Tracking status retrieved' };
  }

  async patchDealer(id: number, data: Partial<DealerDTO> & { username?: string }): Promise<Dealer | null> {
    const updateData: any = { ...data };
    if (updateData.username && !updateData.userName) {
      updateData.userName = updateData.username;
    }
    delete updateData.username;
    if (updateData.password) {
      const isHashed = /^\$2[aby]\$\d{2}\$/.test(updateData.password);
      if (!isHashed) {
        updateData.password = await bcrypt.hash(updateData.password, 10);
      }
    }
    await this.dealerRepository.update(id, updateData);
    const updated = await this.dealerRepository.findOneBy({ id });
    try {
      await this.redisService.del('dealers:all');
      if (updated?.email) await this.redisService.del(`dealer:email:${updated.email}`);
    } catch {}
    return updated;
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

  async confirmOrder(orderId: number, status: string = 'confirmed') {
    const normalized = (status || 'confirmed').trim().toLowerCase();
    if (normalized === 'delivered') {
      throw new BadRequestException('Dealers cannot mark orders as delivered. Only delivery personnel can complete deliveries.');
    }

    const order = await this.orderRepository.findOne({ where: { id: orderId } });
    if (!order) throw new NotFoundException('Order not found');
    order.status = normalized;
    await this.orderRepository.save(order);

    const delivery = await this.deliveryRepository.findOne({
      where: { orderDetails: { order: { id: orderId } } }
    });
    if (delivery) {
      delivery.deliveryStatus = normalized === 'accepted' || normalized === 'confirmed' ? 'processing' : 'rejected';
      await this.deliveryRepository.save(delivery);
    }

    return { order, delivery, message: `Order status updated to ${normalized} by dealer` };
  }

  async scheduleDelivery(orderId: number, deliveryDate: string) {
    const order = await this.orderRepository.findOne({ where: { id: orderId } });
    if (!order) throw new NotFoundException('Order not found');

    const delivery = await this.deliveryRepository.findOne({
      where: { orderDetails: { order: { id: orderId } } }
    });
    if (delivery) {
      delivery.deliveryStatus = `scheduled (Date: ${deliveryDate})`;
      await this.deliveryRepository.save(delivery);
    }

    return { orderId, deliveryDate, delivery, message: "Delivery successfully scheduled by dealer" };
  }

  async findNearbySuppliers(address?: string, radiusKm: number = 60) {
    const dealerCoords = GeoProximityService.geocodeAddress(address);
    const suppliers = await this.supplierRepository.find();

    const supplierLocations: PartnerLocation[] = suppliers.map((s) => ({
      id: s.id,
      name: s.userName || `Refinery Supplier #${s.id}`,
      role: 'Supplier' as const,
      email: s.email,
      phone: s.phoneNumber,
      address: s.address || 'Central Refinery Terminal',
      coordinates: GeoProximityService.geocodeAddress(s.address || s.userName),
    }));

    const nearby = GeoProximityService.findNearbyPartners(dealerCoords, supplierLocations, radiusKm);

    return {
      dealerLocation: {
        address: address || 'Current Dealer Depot',
        coordinates: dealerCoords,
      },
      radiusKm,
      totalFound: nearby.length,
      nearbySuppliers: nearby,
    };
  }
}