import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('order_reviews')
export class ReviewEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  orderId: number;

  @Column({ type: 'int', nullable: true })
  productId: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  productName: string;

  @Column({ type: 'int', default: 5 })
  rating: number;

  @Column({ type: 'text' })
  comment: string;

  @Column({ type: 'varchar', length: 255, default: 'Verified Buyer' })
  reviewerName: string;

  @Column({ type: 'varchar', length: 100, default: 'Customer' })
  reviewerRole: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  deliveryAddress: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
