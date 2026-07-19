import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
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

}