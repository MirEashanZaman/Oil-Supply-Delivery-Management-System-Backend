import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Product } from '../product/product.entity';
@Entity()
export class Category {
    @PrimaryGeneratedColumn()
    id?: number;
    @Column()
    name?: string;
    @ManyToOne(() => Product, product => product.categories)
    product?: Product;
}