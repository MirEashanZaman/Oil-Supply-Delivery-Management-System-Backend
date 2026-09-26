import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseIntPipe,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ReviewService } from './review.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { ReviewEntity } from './review.entity';

@Controller('review')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @Post('submit')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async submitReview(@Body() dto: CreateReviewDto): Promise<ReviewEntity> {
    return this.reviewService.createOrUpdateReview(dto);
  }

  @Get('list')
  async getAllReviews(): Promise<ReviewEntity[]> {
    return this.reviewService.getAllReviews();
  }

  @Get('product/:productId')
  async getReviewsByProduct(
    @Param('productId', ParseIntPipe) productId: number,
  ): Promise<ReviewEntity[]> {
    return this.reviewService.getReviewsByProduct(productId);
  }

  @Get('order/:orderId')
  async getReviewByOrder(
    @Param('orderId', ParseIntPipe) orderId: number,
  ): Promise<ReviewEntity | null> {
    return this.reviewService.getReviewByOrder(orderId);
  }
}
