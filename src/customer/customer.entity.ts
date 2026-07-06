import { Entity, PrimaryGeneratedColumn, Column } from "typeorm"

@Entity()
export class CustomerEntity {
    @PrimaryGeneratedColumn()
    id?: number;
    @Column()
    name?: string;
    @Column()
    email?: string;
    @Column()
    password?: string;
    @Column()
    nid?: string;
    @Column()
    filename?: string;
}