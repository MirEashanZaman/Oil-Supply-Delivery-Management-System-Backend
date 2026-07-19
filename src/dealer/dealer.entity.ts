import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

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
}