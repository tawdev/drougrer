import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';
import { Category } from '../categories/category.entity';
import { Brand } from '../brands/brand.entity';

@Entity('products')
export class Product {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column({ nullable: true })
    sku: string;

    @Column('decimal', { precision: 10, scale: 2, default: 0 })
    price: number;

    @Column('decimal', { precision: 10, scale: 2, nullable: true })
    oldPrice: number;

    @Column({ default: 0 })
    salesCount: number;

    @Column({ default: 0 })
    stock: number;

    @Column({ nullable: true })
    imageUrl: string;

    @Column('simple-json', { nullable: true })
    imageUrls: string[];

    @ManyToOne(() => Category, { nullable: true, eager: false })
    @JoinColumn({ name: 'categoryId' })
    category: Category;

    @ManyToOne(() => Brand, { nullable: true, eager: false })
    @JoinColumn({ name: 'brandId' })
    brand: Brand;

    @Column({ nullable: true })
    categoryId: number;

    @Column({ nullable: true })
    brandId: number;

    @Column({ default: false })
    onSale: boolean;

    @Column({ default: false })
    ecoFriendly: boolean;

    @Column('simple-array', { nullable: true })
    tags: string[];

    @Column({ type: 'text', nullable: true })
    description: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
