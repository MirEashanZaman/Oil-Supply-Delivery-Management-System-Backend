import { Entity, Column, PrimaryGeneratedColumn, BeforeInsert } from 'typeorm';
import { randomUUID } from 'crypto';

@Entity("supplier")
export class SupplierEntity {
    @PrimaryGeneratedColumn({ unsigned: true })
    id?: number;
    @Column({ type: "varchar", length: 100 })
    fullname?: string;
    @Column({ type: "int", unsigned: true })
    age?: number;
    @Column({ type: 'enum', enum: ['active', 'inactive'], default: 'active' })
    status?: string;

    @Column({ unique: true })
    email?: string;

    @Column()
    password?: string;

    @Column({ nullable: true })
    filename?: string;

    @Column({ nullable: true })
    nid?: string;

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

    @BeforeInsert()
    generateSupplierId(): void {
        this.supplierId = randomUUID();
    }
}