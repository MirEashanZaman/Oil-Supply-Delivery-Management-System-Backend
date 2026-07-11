import { Entity, PrimaryGeneratedColumn, Column, ManyToMany } from 'typeorm';
import { Product } from '../product/product.entity';
@Entity()
export class Category {
    @PrimaryGeneratedColumn()
    id?: number;
    @Column()
    name?: string;
    @ManyToMany(() => Product, product => product.categories)
    products?: Product[];
}