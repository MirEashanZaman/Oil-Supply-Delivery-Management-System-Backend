import { IsInt, IsNotEmpty, IsOptional, IsString, Max, Min } from 'class-validator';

export class CreateReviewDto {
  @IsInt()
  @IsNotEmpty()
  orderId: number;

  @IsInt()
  @IsOptional()
  productId?: number;

  @IsString()
  @IsOptional()
  productName?: string;

  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @IsString()
  @IsNotEmpty()
  comment: string;

  @IsString()
  @IsOptional()
  reviewerName?: string;

  @IsString()
  @IsOptional()
  reviewerRole?: string;

  @IsString()
  @IsOptional()
  deliveryAddress?: string;
}
