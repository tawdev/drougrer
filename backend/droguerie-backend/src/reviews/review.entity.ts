import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    ManyToOne,
    JoinColumn
} from 'typeorm';
import { Product } from '../products/product.entity';

export enum ReviewStatus {
    PENDING = 'pending',
    APPROVED = 'approved',
    REJECTED = 'rejected',
}

@Entity('reviews')
export class Review {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    productId: number;

    @Column()
    name: string;

    @Column('int')
    rating: number;

    @Column('text')
    comment: string;

    @Column({
        type: 'varchar',
        default: ReviewStatus.PENDING,
    })
    status: ReviewStatus | string;

    @CreateDateColumn()
    createdAt: Date;

    // Optional relation back to Product if needed for advanced queries.
    @ManyToOne(() => Product, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'productId' })
    product: Product;
}
