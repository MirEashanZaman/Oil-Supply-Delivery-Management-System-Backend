import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm"

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
    @ManyToOne(() => DealerEntity, (dealer) => CustomerEntity.dealers)
    dealer?: CustomerEntity;
}