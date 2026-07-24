import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Category } from '../category/category.entity';
@Entity()
export class Product {
    @PrimaryGeneratedColumn()
    id?: number;
    @Column()
    name?: string;
    @Column({ type: 'int', default: 0 })
    quantity?: number;
    @Column({ type: 'double precision', default: 0 })
    price?: number;
    @OneToMany(() => Category, category => category.product)
    categories?: Category[];
}