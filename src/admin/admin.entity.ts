import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, BeforeInsert } from "typeorm";
import { randomUUID } from "crypto";

@Entity("admin")
export class AdminEntity {
    @PrimaryGeneratedColumn()
    id?: number;

    @Column({
        type: "varchar",
        length: 150,
    })
    uniqueId?: string;

    @CreateDateColumn()
    joiningDate?: Date;

    @Column({
        type: "varchar",
        length: 30,
        default: "Unknown",
    })
    country?: string;

    @Column({ unique: true })
    email?: string;

    @Column()
    password?: string;

    @Column({ nullable: true })
    filename?: string;

    @Column({ nullable: true })
    nid?: string;

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
    generateUuid() {
        this.uniqueId = randomUUID();
        this.adminId = this.uniqueId;
    }
}