import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { CustomerEntity } from "../customer/customer.entity";
import { Product } from "../product/product.entity";

@Entity()
export class OrderEntity {
    @PrimaryGeneratedColumn()
    id?: number;
    @Column()
    orderNumber?: string;
    @Column({ type: 'int', default: 1 })
    quantity?: number;
    @ManyToOne(() => CustomerEntity, customer => customer.orders)
    customer?: CustomerEntity;
    @ManyToOne(() => Product)
    product?: Product;
}