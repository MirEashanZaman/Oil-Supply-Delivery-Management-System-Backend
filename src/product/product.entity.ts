import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Category } from '../category/category.entity';
@Entity()
export class Product {
    @PrimaryGeneratedColumn()
    id?: number;
    @Column()
    name?: string;
    @OneToMany(() => Category, category => category.product)
    categories?: Category[];
}