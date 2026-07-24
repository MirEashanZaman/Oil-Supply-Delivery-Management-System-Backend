import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToOne, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { OrderEntity } from './order.entity';
import { Product } from '../product/product.entity';
import { PaymentEntity } from '../payment/payment.entity';
import { DeliveryEntity } from '../delivery/delivery.entity';

@Entity()
export class OrderDetailsEntity {
    @PrimaryGeneratedColumn()
    id?: number;

    @Column({ type: 'int', default: 1 })
    quantity?: number;

    @Column({ type: 'double precision', default: 0 })
    unitPrice?: number;

    @CreateDateColumn()
    orderDate?: Date;

    @Column({ type: 'double precision', default: 0 })
    discount?: number;

    @OneToOne(() => OrderEntity)
    @JoinColumn()
    order?: OrderEntity;

    @ManyToOne(() => Product)
    product?: Product;

    @OneToOne(() => PaymentEntity)
    @JoinColumn()
    payment?: PaymentEntity;

    @OneToMany(() => DeliveryEntity, delivery => delivery.orderDetails)
    deliveries?: DeliveryEntity[];

    calSubTotal(): number {
        const price = this.unitPrice || 0;
        const qty = this.quantity || 1;
        const disc = this.discount || 0;
        return (price * qty) - disc;
    }
}
