import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReviewEntity } from './review.entity';
import { CreateReviewDto } from './dto/create-review.dto';
import { OrderEntity } from '../order/order.entity';

@Injectable()
export class ReviewService {
  constructor(
    @InjectRepository(ReviewEntity)
    private readonly reviewRepo: Repository<ReviewEntity>,
    @InjectRepository(OrderEntity)
    private readonly orderRepo: Repository<OrderEntity>,
  ) {}

  async createOrUpdateReview(dto: CreateReviewDto): Promise<ReviewEntity> {
    if (dto.orderId) {
      const order = await this.orderRepo.findOne({ where: { id: dto.orderId } });
      if (order && order.status) {
        const normalized = String(order.status).trim().toLowerCase();
        const isDelivered =
          normalized === 'delivered' ||
          normalized === 'completed' ||
          normalized === 'complete' ||
          normalized === 'received' ||
          normalized === 'delivery complete' ||
          normalized === 'successful';

        if (!isDelivered) {
          throw new BadRequestException(
            `Reviews can only be submitted for completed/delivered orders. Current order status: "${order.status}"`,
          );
        }
      }
    }

    let existing = await this.reviewRepo.findOne({ where: { orderId: dto.orderId } });
    if (!existing) {
      existing = this.reviewRepo.create(dto);
    } else {
      existing.rating = dto.rating;
      existing.comment = dto.comment;
      if (dto.productName) existing.productName = dto.productName;
      if (dto.reviewerName) existing.reviewerName = dto.reviewerName;
      if (dto.reviewerRole) existing.reviewerRole = dto.reviewerRole;
      if (dto.deliveryAddress) existing.deliveryAddress = dto.deliveryAddress;
    }

    return this.reviewRepo.save(existing);
  }

  async getAllReviews(): Promise<ReviewEntity[]> {
    return this.reviewRepo.find({
      order: { createdAt: 'DESC' },
    });
  }

  async getReviewsByProduct(productId: number): Promise<ReviewEntity[]> {
    return this.reviewRepo.find({
      where: { productId },
      order: { createdAt: 'DESC' },
    });
  }

  async getReviewByOrder(orderId: number): Promise<ReviewEntity | null> {
    return this.reviewRepo.findOne({
      where: { orderId },
    });
  }
}
