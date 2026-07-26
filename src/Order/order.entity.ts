import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, BeforeInsert } from 'typeorm';
import { CustomerEntity } from "../customer/customer.entity";
import { Product } from "../product/product.entity";
import { randomUUID } from 'crypto';

@Entity()
export class OrderEntity {
    @PrimaryGeneratedColumn()
    id?: number;
    @Column({ nullable: true })
    orderNumber?: string;
    @Column({ type: 'int', default: 1 })
    quantity?: number;
    @ManyToOne(() => CustomerEntity, customer => customer.orders)
    customer?: CustomerEntity;
    @ManyToOne(() => Product)
    product?: Product;

    @BeforeInsert()
    generateOrderNumber(): void {
        this.orderNumber = randomUUID();
    }
}