import { Entity, PrimaryGeneratedColumn, Column, OneToMany, BeforeInsert } from "typeorm"
import { OrderEntity } from "../order/order.entity";

@Entity()
export class CustomerEntity {
    @PrimaryGeneratedColumn()
    id?: number;
    @Column({ length: 100, unique: true })
    username?: string;
    @Column({ length: 150 })
    fullName?: string;
    @Column({ default: false })
    isActive?: boolean;
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

    @BeforeInsert()
    generateId() {
        if (!this.id) {
            this.id = Math.floor(Math.random() * 1000000);
        }
    }
}
