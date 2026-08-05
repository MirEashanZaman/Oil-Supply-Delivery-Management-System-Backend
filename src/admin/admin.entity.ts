import { Entity, PrimaryGeneratedColumn, Column, BeforeInsert, CreateDateColumn, OneToMany } from "typeorm";
import { randomUUID } from "crypto";
import { Product } from "../product/product.entity";

@Entity("admin")
export class AdminEntity {
    @PrimaryGeneratedColumn()
    id?: number;

    @Column({ unique: true })
    email?: string;

    @Column()
    password?: string;

    @Column({ nullable: true })
    filename?: string;

    @Column({ nullable: true })
    adminId?: string;

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

    @OneToMany(() => Product, product => product.admin)
    products?: Product[];

    @BeforeInsert()
    generateAdminId() {
        this.adminId = randomUUID();
    }
}