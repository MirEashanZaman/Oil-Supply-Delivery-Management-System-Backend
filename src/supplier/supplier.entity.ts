import { Entity, Column, PrimaryGeneratedColumn, BeforeInsert, ManyToMany, JoinTable, CreateDateColumn, ManyToOne, OneToMany } from 'typeorm';
import { randomUUID } from 'crypto';
import { Exclude } from 'class-transformer';
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
    @Exclude({ toPlainOnly: true })
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

    @Column({ nullable: true, default: 'BPC-REF-88390' })
    refineryLicenseNumber?: string;

    @Column({ type: 'int', nullable: true, default: 5000000 })
    storageCapacityLiters?: number;

    @Column({ nullable: true, default: 'Chittagong Coastal Berth #4' })
    berthPortLocation?: string;

    @Column({ nullable: true, default: 'ISO 9001:2015 & ASTM-D Verified' })
    isoCertification?: string;

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