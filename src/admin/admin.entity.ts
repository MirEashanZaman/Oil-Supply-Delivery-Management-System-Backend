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

    @BeforeInsert()
    generateUuid() {
        this.uniqueId = randomUUID();
    }
}