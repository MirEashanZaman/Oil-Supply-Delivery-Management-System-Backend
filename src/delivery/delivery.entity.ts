import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { OrderDetailsEntity } from '../order/order-details.entity';

@Entity()
export class DeliveryEntity {
    @PrimaryGeneratedColumn()
    id?: number;

    @Column({ nullable: true })
    address?: string;

    @Column({ type: 'double precision', default: 0 })
    deliveryStatus?: number;

    @ManyToOne(() => OrderDetailsEntity, orderDetails => orderDetails.deliveries)
    orderDetails?: OrderDetailsEntity;
}
