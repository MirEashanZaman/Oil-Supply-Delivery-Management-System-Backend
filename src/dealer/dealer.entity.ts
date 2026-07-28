import { Entity, Column, PrimaryGeneratedColumn, BeforeInsert, ManyToMany, JoinTable, CreateDateColumn } from 'typeorm';
import { randomUUID } from 'crypto';
import { Product } from '../product/product.entity';

@Entity()
export class Dealer {
    @PrimaryGeneratedColumn()
    id?: number;


    @Column({ unique: true })
    email?: string;

    @Column()
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

    @CreateDateColumn({ type: 'timestamp', nullable: true })
    joiningDate?: Date;

    @ManyToMany(() => Product, product => product.dealers)
    @JoinTable({ name: 'dealer_products' })
    products?: Product[];

    @BeforeInsert()
    generateDealerId(): void {
        this.dealerId = randomUUID();
    }
}