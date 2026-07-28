import { Entity, PrimaryGeneratedColumn, Column, OneToMany, BeforeInsert, CreateDateColumn } from "typeorm"
import { randomUUID } from "crypto";
import { OrderEntity } from "../order/order.entity";

@Entity()
export class CustomerEntity {
    @PrimaryGeneratedColumn()
    id?: number;

    @Column({ nullable: true })
    customerId?: string;

    @Column({ length: 100, unique: true })
    username?: string;
    @Column()
    email?: string;
    @Column()
    password?: string;
    @Column({ nullable: true })
    filename?: string;

    @Column({ nullable: true })
    phoneNumber?: string;

    @Column({ nullable: true })
    address?: string;

    @Column({ nullable: true })
    title?: string;

    @CreateDateColumn({ type: 'timestamp', nullable: true })
    joiningDate?: Date;

    @BeforeInsert()
    generateCustomerId(): void {
        this.customerId = randomUUID();
    }

    @OneToMany(() => OrderEntity, order => order.customer)
    orders?: OrderEntity[];
}
