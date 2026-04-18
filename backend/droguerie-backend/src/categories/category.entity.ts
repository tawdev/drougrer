import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { Product } from '../products/product.entity';

@Entity('categories')
export class Category {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    name: string;

    @Column({ nullable: true })
    description: string;

    @Column({ default: true })
    isActive: boolean;

    @Column({ nullable: true })
    parentId: number;

    @ManyToOne(() => Category, (category) => category.children, { onDelete: 'SET NULL' })
    @JoinColumn({ name: 'parentId' })
    parent: Category;

    @OneToMany(() => Category, (category) => category.parent)
    children: Category[];

    @CreateDateColumn()
    createdAt: Date;

    @OneToMany(() => Product, (product) => product.category)
    products: Product[];
}
