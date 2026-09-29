import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { OrderDetailsEntity } from '../order/order-details.entity';
import { Dealer } from '../dealer/dealer.entity';
import { SupplierEntity } from '../supplier/supplier.entity';
import { DeliverymanEntity } from '../deliveryman/deliveryman.entity';
import { OrderEntity } from '../order/order.entity';

@Entity()
export class DeliveryEntity {
    @PrimaryGeneratedColumn()
    id?: number;

    @Column({ nullable: true })
    address?: string;

    @Column({ default: 'pending' })
    deliveryStatus?: string;

    @ManyToOne(() => OrderDetailsEntity, orderDetails => orderDetails.deliveries, { onDelete: 'CASCADE', nullable: true })
    orderDetails?: OrderDetailsEntity;

    @ManyToOne(() => OrderEntity, { nullable: true, onDelete: 'CASCADE' })
    order?: OrderEntity;

    @ManyToOne(() => Dealer, { nullable: true })
    dealer?: Dealer;

    @ManyToOne(() => SupplierEntity, { nullable: true })
    supplier?: SupplierEntity;

    @ManyToOne(() => DeliverymanEntity, deliveryman => deliveryman.deliveries, { nullable: true })
    deliveryman?: DeliverymanEntity;
}

