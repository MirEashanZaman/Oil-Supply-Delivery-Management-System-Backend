import { Entity, Column, PrimaryGeneratedColumn, BeforeInsert } from 'typeorm';
import { randomUUID } from 'crypto';

@Entity()
export class Dealer {
    @PrimaryGeneratedColumn()
    id?: number;

    @Column({ type: 'varchar', nullable: true })
    fullName?: string;

    @Column({ type: 'bigint', unsigned: true })
    phone?: number;

    @Column({ unique: true })
    email?: string;

    @Column()
    password?: string;

    @Column({ nullable: true })
    filename?: string;

    @Column({ nullable: true })
    nid?: string;

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

    @BeforeInsert()
    generateDealerId(): void {
        this.dealerId = randomUUID();
    }
}