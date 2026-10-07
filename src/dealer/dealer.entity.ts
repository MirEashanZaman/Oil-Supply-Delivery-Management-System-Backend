import { Entity, Column, PrimaryGeneratedColumn, BeforeInsert, ManyToMany, JoinTable, CreateDateColumn, ManyToOne, OneToMany } from 'typeorm';
import { randomUUID } from 'crypto';
import { Exclude } from 'class-transformer';
import { Product } from '../product/product.entity';
import { AdminEntity } from '../admin/admin.entity';
import { OrderEntity } from '../order/order.entity';
import { DeliveryEntity } from '../delivery/delivery.entity';

@Entity()
export class Dealer {
    @PrimaryGeneratedColumn()
    id?: number;

    @Column({ unique: true })
    email?: string;

    @Column()
    @Exclude({ toPlainOnly: true })
    password?: string;

    @Column({ nullable: true })
    filename?: string;

    @Column({ nullable: true })
    dealerId?: string;

    @Column({ nullable: true })
    phoneNumber?: string;

    @Column({ nullable: true })
    userName?: string;

    @Column({ nullable: true })
    address?: string;

    @Column({ nullable: true })
    title?: string;

    @Column({ nullable: true, default: 'DLR-STATION-4491' })
    stationLicenseNumber?: string;

    @Column({ type: 'int', nullable: true, default: 80000 })
    undergroundTankCapacity?: number;

    @Column({ type: 'int', nullable: true, default: 12 })
    nozzlesCount?: number;

    @Column({ type: 'double precision', nullable: true, default: 250000.0 })
    creditLimit?: number;

    @CreateDateColumn({ type: 'timestamp', nullable: true })
    joiningDate?: Date;

    @ManyToOne(() => AdminEntity, admin => admin.dealers, { nullable: true })
    admin?: AdminEntity;

    @ManyToMany(() => Product, product => product.dealers)
    @JoinTable({ name: 'dealer_products' })
    products?: Product[];

    @OneToMany(() => OrderEntity, order => order.dealer)
    orders?: OrderEntity[];

    @OneToMany(() => DeliveryEntity, delivery => delivery.dealer)
    deliveries?: DeliveryEntity[];

    @BeforeInsert()
    generateDealerId(): void {
        this.dealerId = randomUUID();
    }
}