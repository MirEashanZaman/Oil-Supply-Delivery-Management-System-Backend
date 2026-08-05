import { Entity, Column, PrimaryGeneratedColumn, BeforeInsert, ManyToMany, JoinTable, CreateDateColumn, ManyToOne, OneToMany } from 'typeorm';
import { randomUUID } from 'crypto';
import { Product } from '../product/product.entity';
import { AdminEntity } from '../admin/admin.entity';
import { OrderEntity } from '../order/order.entity';
import { DeliveryEntity } from '../delivery/delivery.entity';

@Entity("supplier")
export class SupplierEntity {
    @PrimaryGeneratedColumn({ unsigned: true })
    id?: number;
    @Column({ type: 'enum', enum: ['active', 'inactive'], default: 'active' })
    status?: string;

    @Column({ unique: true })
    email?: string;

    @Column()
    password?: string;

    @Column({ nullable: true })
    filename?: string;

    @Column({ nullable: true })
    supplierId?: string;

    @Column({ nullable: true })
    phoneNumber?: string;

    @Column({ nullable: true })
    userName?: string;

    @Column({ nullable: true })
    address?: string;

    @Column({ nullable: true })
    title?: string;

    @CreateDateColumn({ type: 'timestamp', nullable: true })
    joiningDate?: Date;

    @ManyToOne(() => AdminEntity, admin => admin.suppliers, { nullable: true })
    admin?: AdminEntity;

    @ManyToMany(() => Product, product => product.suppliers)
    @JoinTable({ name: 'supplier_products' })
    products?: Product[];

    @OneToMany(() => OrderEntity, order => order.supplier)
    orders?: OrderEntity[];

    @OneToMany(() => DeliveryEntity, delivery => delivery.supplier)
    deliveries?: DeliveryEntity[];

    @BeforeInsert()
    generateSupplierId(): void {
        this.supplierId = randomUUID();
    }
}