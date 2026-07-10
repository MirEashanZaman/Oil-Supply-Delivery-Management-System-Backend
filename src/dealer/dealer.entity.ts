import { Entity, OneToMany, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class Manager {
    @PrimaryGeneratedColumn()
    id?: number;
    @Column()
    name?: string;
    @Column()
    email?: string;
    @Column()
    password?: string;
    @Column()
    filename?: string;
    @OneToMany(() => CustomerController, (customer) => customer.dealer, {
        cascade: true
    })
    dealer?: Dealer;

}