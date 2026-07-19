import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm"
import { OrderEntity } from "../order/order.entity";

@Entity()
export class CustomerEntity {
    @PrimaryGeneratedColumn()
    id?: number;
    @Column({ length: 100, unique: true })
    username?: string;
    @Column({  select: false })
    fullName?: string;
    @Column()
    email?: string;
    @Column()
    password?: string;
    @Column()
    nid?: string;
    @Column()
    filename?: string;

    @Column({ nullable: true })
    phoneNumber?: string;

    @Column({ nullable: true })
    address?: string;

    @Column({ nullable: true })
    title?: string;

    @OneToMany(() => OrderEntity, order => order.customer)
    orders?: OrderEntity[];
}
