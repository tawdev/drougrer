import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';
import { encryptionTransformer } from '../utils/encryption-transformer';

@Entity('newsletter_subscribers')
export class NewsletterSubscriber {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'text', transformer: encryptionTransformer })
    email: string;

    @Index()
    @Column({ nullable: true })
    emailHash: string;

    @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP(6)' })
    subscribedAt: Date;
}
