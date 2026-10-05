import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { DeliverymanEntity } from './deliveryman.entity';
import { DeliverymanDTO } from './deliveryman.dto';
import { OrderEntity } from '../order/order.entity';
import { DeliveryEntity } from '../delivery/delivery.entity';
import { GeoProximityService, GeoCoordinate } from '../patterns/geo/geo-proximity.service';
import { MailerService } from '@nestjs-modules/mailer';
import * as bcrypt from 'bcrypt';
import { RedisService } from '../redis/redis.service';

export interface NearbyOrderResult {
    orderId: number;
    orderNumber?: string;
    productName: string;
    quantity: number;
    status: string;
    destinationAddress: string;
    customerName?: string;
    customerEmail?: string;
    customerPhone?: string;
    sourceType?: string;
    assignedDeliverymanId?: number;
    coordinates: GeoCoordinate;
    distanceKm: number;
    estimatedTransitMinutes: number;
}

@Injectable()
export class DeliverymanService {
    constructor(
        @InjectRepository(DeliverymanEntity)
        private deliverymanRepo: Repository<DeliverymanEntity>,
        @InjectRepository(OrderEntity)
        private orderRepo: Repository<OrderEntity>,
        @InjectRepository(DeliveryEntity)
        private deliveryRepo: Repository<DeliveryEntity>,
        private mailerService: MailerService,
        private redisService: RedisService,
    ) { }

    async sendEmail(to: string, subject: string, text: string) {
        try {
            return await this.mailerService.sendMail({
                to,
                subject,
                text,
            });
        } catch (err) {
            console.warn(`[DeliverymanService] Email sending failed to ${to}:`, err);
            return null;
        }
    }

    async createDeliveryman(data: DeliverymanDTO): Promise<DeliverymanEntity> {
        const existing = await this.deliverymanRepo.findOneBy({ email: data.email });
        if (existing) {
            throw new ConflictException('Deliveryman with this email already exists');
        }
        const deliveryman = this.deliverymanRepo.create({
            ...data,
            title: 'Deliveryman',
            status: 'pending_approval',
        });
        const saved = await this.deliverymanRepo.save(deliveryman);
        try {
            await this.redisService.del('deliverymen:all');
        } catch {}
        return saved;
    }

    async findByEmail(email: string): Promise<DeliverymanEntity | null> {
        const cacheKey = `deliveryman:email:${email}`;
        try {
            const cached = await this.redisService.get(cacheKey);
            if (cached) return JSON.parse(cached);
        } catch {}

        const deliveryman = await this.deliverymanRepo.findOneBy({ email });
        if (deliveryman) {
            try {
                await this.redisService.set(cacheKey, JSON.stringify(deliveryman), 60);
            } catch {}
        }
        return deliveryman;
    }

    async getDeliverymanById(id: number): Promise<DeliverymanEntity | null> {
        const cacheKey = `deliveryman:id:${id}`;
        try {
            const cached = await this.redisService.get(cacheKey);
            if (cached) return JSON.parse(cached);
        } catch {}

        const deliveryman = await this.deliverymanRepo.findOneBy({ id });
        if (deliveryman) {
            try {
                await this.redisService.set(cacheKey, JSON.stringify(deliveryman), 60);
            } catch {}
        }
        return deliveryman;
    }

    async getAllDeliverymen(): Promise<DeliverymanEntity[]> {
        const cacheKey = 'deliverymen:all';
        try {
            const cached = await this.redisService.get(cacheKey);
            if (cached) return JSON.parse(cached);
        } catch {}

        const deliverymen = await this.deliverymanRepo.find();
        try {
            await this.redisService.set(cacheKey, JSON.stringify(deliverymen), 60);
        } catch {}
        return deliverymen;
    }

    async patchDeliveryman(id: number, data: Partial<DeliverymanDTO> & { username?: string }): Promise<DeliverymanEntity> {
        const deliveryman = await this.deliverymanRepo.findOneBy({ id });
        if (!deliveryman) throw new NotFoundException('Deliveryman not found');
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
        Object.assign(deliveryman, updateData);
        const saved = await this.deliverymanRepo.save(deliveryman);
        try {
            await this.redisService.del('deliverymen:all');
            await this.redisService.del(`deliveryman:id:${id}`);
            if (saved.email) await this.redisService.del(`deliveryman:email:${saved.email}`);
        } catch {}
        return saved;
    }

    async getNearbyOrders(deliverymanAddress?: string, radiusKm: number = 50): Promise<NearbyOrderResult[]> {
        const deliverymanCoords = GeoProximityService.geocodeAddress(deliverymanAddress);

        const orders = await this.orderRepo.find({
            relations: {
                customer: true,
                product: true,
                supplier: true,
                dealer: true,
                deliveryman: true,
            },
        });

        // Filter orders that are either unassigned or in a state that deliverymen can accept
        const activeOrders = orders.filter((o) => {
            const st = (o.status || 'pending').toLowerCase();
            return (
                st !== 'delivered' &&
                st !== 'cancelled' &&
                st !== 'rejected'
            );
        });

        const nearbyList: NearbyOrderResult[] = activeOrders.map((order) => {
            const destAddr = order.customer?.address || 'Dhaka Central Hub';
            const orderCoords = GeoProximityService.geocodeAddress(destAddr);
            const distanceKm = GeoProximityService.calculateHaversineDistanceKm(
                deliverymanCoords,
                orderCoords,
            );
            const estimatedTransitMinutes = Math.max(
                10,
                Math.round((distanceKm / 35) * 60),
            );

            return {
                orderId: order.id as number,
                orderNumber: order.orderNumber,
                productName: order.product?.name || 'Petroleum Fuel',
                quantity: order.quantity || 1,
                status: order.status || 'pending',
                destinationAddress: destAddr,
                customerName: order.customer?.username || order.customer?.title || 'Customer',
                customerEmail: order.customer?.email,
                customerPhone: order.customer?.phoneNumber,
                sourceType: order.sourceType || (order.supplierId ? 'Supplier' : 'Dealer'),
                assignedDeliverymanId: order.deliverymanId || order.deliveryman?.id,
                coordinates: orderCoords,
                distanceKm,
                estimatedTransitMinutes,
            };
        });

        return nearbyList
            .filter((o) => o.distanceKm <= radiusKm)
            .sort((a, b) => a.distanceKm - b.distanceKm);
    }

    async getMyDeliveries(deliverymanId: number) {
        return this.orderRepo.find({
            where: [
                { deliverymanId },
                { deliveryman: { id: deliverymanId } }
            ],
            relations: {
                customer: true,
                product: true,
                supplier: true,
                dealer: true,
            },
        });
    }

    async acceptOrder(orderId: number, deliverymanId: number) {
        const order = await this.orderRepo.findOne({
            where: { id: orderId },
            relations: { customer: true, product: true, deliveryman: true },
        });
        if (!order) throw new NotFoundException('Order not found');

        const deliveryman = await this.deliverymanRepo.findOneBy({ id: deliverymanId });
        if (!deliveryman) throw new NotFoundException('Deliveryman not found');

        if (order.deliverymanId && order.deliverymanId !== deliverymanId) {
            throw new BadRequestException('This order is already assigned to another delivery personnel');
        }

        order.deliveryman = deliveryman;
        order.deliverymanId = deliveryman.id;
        order.status = 'out for delivery';
        await this.orderRepo.save(order);

        let delivery = await this.deliveryRepo.findOne({
            where: { order: { id: orderId } }
        });
        if (!delivery) {
            delivery = this.deliveryRepo.create({
                order,
                deliveryman,
                deliveryStatus: 'out for delivery',
                address: order.customer?.address || deliveryman.address,
            });
        } else {
            delivery.deliveryman = deliveryman;
            delivery.deliveryStatus = 'out for delivery';
        }
        await this.deliveryRepo.save(delivery);

        if (order.customer?.email) {
            await this.sendEmail(
                order.customer.email,
                `Delivery Update: Order #${order.id} is Out for Delivery!`,
                `Dear ${order.customer.username || 'Customer'},\n\nYour order #${order.id} has been accepted by our delivery personnel (${deliveryman.userName || deliveryman.email}) and is now OUT FOR DELIVERY.\n\nYour 4-digit Delivery Confirmation PIN is: ${order.deliveryOtp || '1234'}\nPlease provide this PIN or electronic signature to the driver upon fuel offloading.\n\nThank you for choosing Oil Supply & Delivery Management System!`
            );
        }

        return {
            order,
            delivery,
            deliveryOtp: order.deliveryOtp,
            message: `Order #${orderId} accepted successfully and is now out for delivery`,
        };
    }

    async updateLocation(deliverymanId: number, lat: number, lng: number) {
        const deliveryman = await this.deliverymanRepo.findOneBy({ id: deliverymanId });
        if (!deliveryman) throw new NotFoundException('Deliveryman not found');

        deliveryman.currentLatitude = lat;
        deliveryman.currentLongitude = lng;
        await this.deliverymanRepo.save(deliveryman);

        return {
            deliverymanId,
            coordinates: { lat, lng },
            updatedAt: new Date(),
        };
    }

    async completeDelivery(
        orderId: number,
        deliverymanId: number,
        proofData?: { otp?: string; signature?: string; meterReadingPhoto?: string }
    ) {
        const order = await this.orderRepo.findOne({
            where: { id: orderId },
            relations: { customer: true, product: true, deliveryman: true },
        });
        if (!order) throw new NotFoundException('Order not found');

        if (order.deliverymanId && order.deliverymanId !== deliverymanId) {
            throw new BadRequestException('You are not the assigned deliveryman for this order');
        }

        // Validate OTP if provided
        if (proofData?.otp && order.deliveryOtp && proofData.otp.trim() !== order.deliveryOtp.trim()) {
            throw new BadRequestException('Invalid Delivery PIN provided. Please check the 4-digit PIN with the customer.');
        }

        const deliveryman = await this.deliverymanRepo.findOneBy({ id: deliverymanId });

        order.status = 'delivered';
        order.deliveredAt = new Date();
        if (proofData?.signature) order.recipientSignature = proofData.signature;
        if (proofData?.meterReadingPhoto) order.meterReadingPhoto = proofData.meterReadingPhoto;

        if (deliveryman) {
            order.deliveryman = deliveryman;
            order.deliverymanId = deliveryman.id;

            // Calculate driver payout fee: Base $25 + $2.50 per quantity unit
            const tripPayout = 25.0 + (Number(order.quantity || 1) * 2.50);
            deliveryman.totalEarnings = Number((deliveryman.totalEarnings || 0) + tripPayout);
            deliveryman.completedDeliveriesCount = (deliveryman.completedDeliveriesCount || 0) + 1;
            await this.deliverymanRepo.save(deliveryman);
        }
        await this.orderRepo.save(order);

        let delivery = await this.deliveryRepo.findOne({
            where: { order: { id: orderId } }
        });
        if (delivery) {
            delivery.deliveryStatus = 'delivered';
            if (deliveryman) delivery.deliveryman = deliveryman;
            await this.deliveryRepo.save(delivery);
        }

        if (order.customer?.email) {
            await this.sendEmail(
                order.customer.email,
                `Order #${order.id} Successfully Delivered!`,
                `Dear ${order.customer.username || 'Customer'},\n\nYour order #${order.id} for ${order.product?.name || 'Petroleum Fuel'} has been successfully delivered by ${deliveryman?.userName || 'our delivery partner'}.\n\nPlease login to leave your rating and delivery feedback!\n\nBest regards,\nOil Supply & Delivery Team`
            );
        }

        return {
            order,
            delivery,
            message: `Order #${orderId} marked as DELIVERED successfully with electronic proof of delivery`,
        };
    }
}
