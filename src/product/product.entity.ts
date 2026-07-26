import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToMany, BeforeInsert } from 'typeorm';
import { Category } from '../category/category.entity';
import { Dealer } from '../dealer/dealer.entity';
import { SupplierEntity } from '../supplier/supplier.entity';
import { randomUUID } from 'crypto';
@Entity()
export class Product {
    @PrimaryGeneratedColumn()
    id?: number;
    @Column({ nullable: true })
    productId?: string;
    @Column()
    name?: string;
    @Column({ type: 'int', default: 0 })
    quantity?: number;
    @Column({ type: 'double precision', default: 0 })
    price?: number;
    @OneToMany(() => Category, category => category.product)
    categories?: Category[];
    @ManyToMany(() => Dealer, dealer => dealer.products)
    dealers?: Dealer[];

    @ManyToMany(() => SupplierEntity, supplier => supplier.products)
    suppliers?: SupplierEntity[];

    @BeforeInsert()
    generateProductId(): void {
        this.productId = randomUUID();
    }
}