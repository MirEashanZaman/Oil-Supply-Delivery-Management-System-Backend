import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
@Entity("supplier")
export class SupplierEntity {
    @PrimaryGeneratedColumn()
    id?: number;
    @Column()
    name?: string;
    @Column()
    password?: string;
    @Column()
    filename?: string;
    @Column()
    phone?: string;
}