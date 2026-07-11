import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm"
import { OrderEntity } from "../order/order.entity";

@Entity()
export class CustomerEntity {
    @PrimaryGeneratedColumn()
    id?: number;
    @Column()
    name?: string;
    @Column()
    email?: string;
    @Column()
    password?: string;
    @Column()
    nid?: string;
    @Column()
    filename?: string;

    @OneToMany(() => OrderEntity, order => order.customer)
    orders?: OrderEntity[];
}