import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('blog_posts')
export class BlogPost {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    title: string;

    @Column({ unique: true })
    slug: string;

    @Column({ nullable: true })
    category: string;

    @Column({ type: 'text' })
    content: string;

    @Column({ nullable: true })
    excerpt: string;

    @Column({ nullable: true })
    imageUrl: string;

    @Column({ default: 'Draft' }) // Draft, Published
    status: string;

    @Column({ default: 'Admin' })
    author: string;

    @Column({ type: 'simple-json', nullable: true })
    tags: string[];

    @Column({ nullable: true })
    metaTitle: string;

    @Column({ type: 'text', nullable: true })
    metaDescription: string;

    @Column({ nullable: true })
    metaKeywords: string;

    @Column({ type: 'date', nullable: true })
    publishDate: string;

    @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP(6)' })
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP(6)', onUpdate: 'CURRENT_TIMESTAMP(6)' })
    updatedAt: Date;
}
