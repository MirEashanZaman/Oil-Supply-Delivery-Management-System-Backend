import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, BeforeInsert } from 'typeorm';
import { CustomerEntity } from "../customer/customer.entity";
import { Product } from "../product/product.entity";
import { Dealer } from "../dealer/dealer.entity";
import { SupplierEntity } from "../supplier/supplier.entity";
import { DeliverymanEntity } from "../deliveryman/deliveryman.entity";
import { randomUUID } from 'crypto';

@Entity()
export class OrderEntity {
    @PrimaryGeneratedColumn()
    id?: number;
    @Column({ nullable: true })
    orderNumber?: string;
    @Column({ type: 'int', default: 1 })
    quantity?: number;

    @Column({ nullable: true })
    sourceType?: string;

    @Column({ nullable: true })
    supplierId?: number;

    @Column({ nullable: true })
    dealerId?: number;

    @Column({ nullable: true })
    deliverymanId?: number;

    @ManyToOne(() => CustomerEntity, customer => customer.orders, { onDelete: 'CASCADE' })
    customer?: CustomerEntity;
    @ManyToOne(() => Product, { onDelete: 'CASCADE', nullable: true })
    product?: Product;

    @ManyToOne(() => Dealer, dealer => dealer.orders, { nullable: true, onDelete: 'CASCADE' })
    dealer?: Dealer;

    @ManyToOne(() => SupplierEntity, supplier => supplier.orders, { nullable: true, onDelete: 'CASCADE' })
    supplier?: SupplierEntity;

    @ManyToOne(() => DeliverymanEntity, { nullable: true, onDelete: 'SET NULL' })
    deliveryman?: DeliverymanEntity;

    @Column({ default: 'pending' })
    status?: string;

    @Column({ nullable: true })
    deliveryOtp?: string;

    @Column({ nullable: true })
    recipientSignature?: string;

    @Column({ nullable: true })
    meterReadingPhoto?: string;

    @Column({ nullable: true, type: 'timestamp' })
    deliveredAt?: Date;

    @BeforeInsert()
    generateOrderNumber(): void {
        this.orderNumber = randomUUID();
        // Generate a 4-digit secure Delivery Confirmation PIN for customer
        this.deliveryOtp = Math.floor(1000 + Math.random() * 9000).toString();
    }
}