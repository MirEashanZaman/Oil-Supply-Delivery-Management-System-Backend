import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable } from 'typeorm';
import { Category } from '../category/category.entity';
@Entity()
export class Product {
    @PrimaryGeneratedColumn()
    id?: number;
    @Column()
    name?: string;
    @ManyToMany(() => Category, category => category.products)
    @JoinTable()
    categories: Category[] = [];
}