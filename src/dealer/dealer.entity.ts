import { Entity, Column, PrimaryGeneratedColumn, BeforeInsert } from 'typeorm';

@Entity()
export class Dealer {
    @PrimaryGeneratedColumn()
    id?: number;

    @Column({ default: true })
    isActive?: boolean;

    @Column({ type: 'varchar', nullable: true })
    fullName?: string;

    @Column({ type: 'bigint', unsigned: true })
    phone?: number;

    @BeforeInsert()
    generateId(): void {
        if (!this.id) {
            this.id = Math.floor(Math.random() * 1000000);
        }
    }
}