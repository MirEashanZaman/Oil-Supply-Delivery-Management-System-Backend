import { Entity, PrimaryGeneratedColumn, Column, BeforeInsert } from "typeorm";
import { randomUUID } from "crypto";

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

    @BeforeInsert()
    generateAdminId() {
        this.adminId = randomUUID();
    }
}