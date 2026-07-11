import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { CustomerEntity } from "../customer/customer.entity";

@Entity()
export class OrderEntity {
    @PrimaryGeneratedColumn()
    id?: number;
    @Column()
    orderNumber?: string;
    @ManyToOne(() => CustomerEntity, customer => customer.orders)
    customer?: CustomerEntity;
}