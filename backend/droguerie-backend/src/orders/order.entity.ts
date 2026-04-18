import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';
import { encryptionTransformer } from '../utils/encryption-transformer';

export enum OrderStatus {
    PENDING = 'pending',
    CONFIRMED = 'confirmed',
    PROCESSING = 'processing',
    COMPLETED = 'completed',
    CANCELLED = 'cancelled',
}

@Entity('orders')
export class Order {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'text', transformer: encryptionTransformer })
    customerName: string;

    @Column({ type: 'text', transformer: encryptionTransformer })
    email: string;

    @Column({ type: 'text', nullable: true, transformer: encryptionTransformer })
    phone: string;

    @Column({ type: 'text', nullable: true, transformer: encryptionTransformer })
    address: string;

    @Column({ nullable: true })
    invoiceReference: string;

    @Column('simple-json', { nullable: true })
    items: any;

    @Column('decimal', { precision: 10, scale: 2, default: 0 })
    totalPrice: number;

    @Column({
        type: 'varchar',
        default: OrderStatus.PENDING,
    })
    status: OrderStatus;

    @CreateDateColumn()
    createdAt: Date;
}

