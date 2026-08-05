import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { CustomerEntity } from '../customer/customer.entity';

@Entity()
export class PaymentEntity {
    @PrimaryGeneratedColumn()
    id?: number;

    @Column({ default: 'pending' })
    status?: string;

    // Cash Payment Details
    @Column({ type: 'double precision', nullable: true })
    cashTenderer?: number;

    // Card Payment Details
    @Column({ nullable: true })
    cardNumber?: string;

    @Column({ nullable: true })
    cardType?: string;

    @Column({ type: 'date', nullable: true })
    expireDate?: Date;

    @ManyToOne(() => CustomerEntity, customer => customer.payments, { nullable: true, onDelete: 'CASCADE' })
    customer?: CustomerEntity;

    authorized(): boolean {
        return this.status === 'completed' || this.status === 'authorized';
    }
}
