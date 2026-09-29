import { Entity, Column, PrimaryGeneratedColumn, BeforeInsert, CreateDateColumn, ManyToOne, OneToMany } from 'typeorm';
import { randomUUID } from 'crypto';
import { AdminEntity } from '../admin/admin.entity';
import { DeliveryEntity } from '../delivery/delivery.entity';

@Entity('deliveryman')
export class DeliverymanEntity {
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
    deliverymanId?: string;

    @Column({ nullable: true })
    phoneNumber?: string;

    @Column({ nullable: true })
    userName?: string;

    @Column({ nullable: true })
    address?: string;

    @Column({ nullable: true, default: 'Deliveryman' })
    title?: string;

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
