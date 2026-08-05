import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { OrderDetailsEntity } from '../order/order-details.entity';
import { Dealer } from '../dealer/dealer.entity';
import { SupplierEntity } from '../supplier/supplier.entity';

@Entity()
export class DeliveryEntity {
    @PrimaryGeneratedColumn()
    id?: number;

    @Column({ nullable: true })
    address?: string;

    @Column({ default: 'pending' })
    deliveryStatus?: string;

    @ManyToOne(() => OrderDetailsEntity, orderDetails => orderDetails.deliveries)
    orderDetails?: OrderDetailsEntity;

    @ManyToOne(() => Dealer, { nullable: true })
    dealer?: Dealer;

    @ManyToOne(() => SupplierEntity, { nullable: true })
    supplier?: SupplierEntity;
}
