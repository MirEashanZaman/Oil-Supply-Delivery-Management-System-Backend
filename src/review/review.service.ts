import { Injectable, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
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
    private readonly dataSource: DataSource,
  ) {}

  async createOrUpdateReview(dto: CreateReviewDto): Promise<ReviewEntity> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      if (dto.orderId) {
        const order = await queryRunner.manager.findOne(OrderEntity, { where: { id: dto.orderId } });
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

      let existing = await queryRunner.manager.findOne(ReviewEntity, { where: { orderId: dto.orderId } });
      if (!existing) {
        existing = queryRunner.manager.create(ReviewEntity, dto);
      } else {
        existing.rating = dto.rating;
        existing.comment = dto.comment;
        if (dto.productName) existing.productName = dto.productName;
        if (dto.reviewerName) existing.reviewerName = dto.reviewerName;
        if (dto.reviewerRole) existing.reviewerRole = dto.reviewerRole;
        if (dto.deliveryAddress) existing.deliveryAddress = dto.deliveryAddress;
      }

      const savedReview = await queryRunner.manager.save(ReviewEntity, existing);
      await queryRunner.commitTransaction();
      return savedReview;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Failed to persist review. Transaction rolled back: ${error?.message || error}`,
      );
    } finally {
      await queryRunner.release();
    }
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
