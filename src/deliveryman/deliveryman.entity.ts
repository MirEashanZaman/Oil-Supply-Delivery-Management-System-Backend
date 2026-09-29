import { Entity, Column, PrimaryGeneratedColumn, BeforeInsert, CreateDateColumn, ManyToOne, OneToMany } from 'typeorm';
import { randomUUID } from 'crypto';
import { AdminEntity } from '../admin/admin.entity';
import { DeliveryEntity } from '../delivery/delivery.entity';

@Entity('deliveryman')
export class DeliverymanEntity {
    @PrimaryGeneratedColumn({ unsigned: true })
    id?: number;

    @Column({ type: 'enum', enum: ['active', 'inactive', 'pending_approval'], default: 'pending_approval' })
    status?: string;

    @Column({ unique: true })
    email?: string;

    @Column()
    password?: string;

    @Column({ nullable: true })
    filename?: string;

    @Column({ nullable: true })
    deliverymanId?: string;

    @Column({ nullable: true })
    phoneNumber?: string;

    @Column({ nullable: true })
    userName?: string;

    @Column({ nullable: true })
    address?: string;

    @Column({ nullable: true, default: 'Deliveryman' })
    title?: string;

    @Column({ nullable: true, default: 'Tanker Lorry (20,000L)' })
    vehicleType?: string;

    @Column({ nullable: true })
    vehicleRegistrationNumber?: string;

    @Column({ nullable: true })
    drivingLicenseNumber?: string;

    @Column({ nullable: true })
    hazmatCertNumber?: string;

    @Column({ type: 'double precision', nullable: true, default: 0 })
    totalEarnings?: number;

    @Column({ type: 'int', nullable: true, default: 0 })
    completedDeliveriesCount?: number;

    @Column({ type: 'double precision', nullable: true, default: 5.0 })
    rating?: number;

    @Column({ type: 'double precision', nullable: true })
    currentLatitude?: number;

    @Column({ type: 'double precision', nullable: true })
    currentLongitude?: number;

    @CreateDateColumn({ type: 'timestamp', nullable: true })
    joiningDate?: Date;

    @ManyToOne(() => AdminEntity, admin => admin.deliverymen, { nullable: true })
    admin?: AdminEntity;

    @OneToMany(() => DeliveryEntity, delivery => delivery.deliveryman)
    deliveries?: DeliveryEntity[];

    @BeforeInsert()
    generateDeliverymanId(): void {
        this.deliverymanId = randomUUID();
    }
}
