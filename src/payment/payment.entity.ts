import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

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

    authorized(): boolean {
        return this.status === 'completed' || this.status === 'authorized';
    }
}
