import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { BlogPost } from './blog-post.entity';
import { NewsletterService } from '../newsletter/newsletter.service';
import { MailService } from '../mail/mail.service';

@Injectable()
export class BlogService {
    private readonly logger = new Logger(BlogService.name);
    constructor(
        @InjectRepository(BlogPost)
        private blogRepository: Repository<BlogPost>,
        private newsletterService: NewsletterService,
        private mailService: MailService,
    ) { }

    async findAll(page = 1, limit = 10, search?: string, tag?: string, category?: string, sort: 'recent' | 'oldest' = 'recent') {
        const skip = (page - 1) * limit;

        const order: any = {};
        if (sort === 'oldest') {
            order.createdAt = 'ASC';
        } else {
            order.createdAt = 'DESC'; // 'recent'
        }

        const buildWhere = (baseWhere: any) => {
            const where = { ...baseWhere, status: 'Published' };
            if (tag) where.tags = Like(`%"${tag}"%`);
            if (category && category !== 'Tous') where.category = category;
            return where;
        };

        const [data, total] = await this.blogRepository.findAndCount({
            where: search ? [
                buildWhere({ title: Like(`%${search}%`) }),
                buildWhere({ content: Like(`%${search}%`) }),
                buildWhere({ category: Like(`%${search}%`) }),
            ] : buildWhere({}),
            order,
            take: limit,
            skip,
        });

        return {
            data,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }

    async findOne(id: number) {
        const post = await this.blogRepository.findOne({ where: { id } });
        if (!post) throw new NotFoundException(`Blog post with ID ${id} not found`);
        return post;
    }

    async findBySlug(slug: string) {
        const post = await this.blogRepository.findOne({ where: { slug } });
        if (!post) throw new NotFoundException(`Blog post with slug ${slug} not found`);
        return post;
    }

    async create(data: Partial<BlogPost>) {
        if (data.title) {
            data.slug = await this.resolveUniqueSlug(data.slug || data.title);
        }
        const post = this.blogRepository.create(data);
        const savedPost = await this.blogRepository.save(post);

        // Notify if published immediately
        if (savedPost.status === 'Published') {
            this.notifySubscribers(savedPost);
        }
        
        return savedPost;
    }

    async update(id: number, data: Partial<BlogPost>) {
        const post = await this.findOne(id);
        const oldStatus = post.status;

        if (data.title && !data.slug) {
            data.slug = await this.resolveUniqueSlug(data.title, id);
        } else if (data.slug) {
            data.slug = await this.resolveUniqueSlug(data.slug, id);
        }
        Object.assign(post, data);
        const updatedPost = await this.blogRepository.save(post);

        // Notify if status changed from something else to 'Published'
        if (oldStatus !== 'Published' && updatedPost.status === 'Published') {
            this.notifySubscribers(updatedPost);
        }

        return updatedPost;
    }

    private async notifySubscribers(post: BlogPost) {
        try {
            const emails = await this.newsletterService.findAllEmails();
            this.logger.log(`📢 Broadcasting blog post "${post.title}" to ${emails.length} subscribers...`);
            if (emails.length > 0) {
                await this.mailService.sendNewsletterNotification(emails, {
                    title: post.title,
                    excerpt: post.excerpt || (post.content ? post.content.replace(/<[^>]*>/g, '').substring(0, 150) + '...' : ''),
                    type: 'ARTICLE',
                    slug: post.slug,
                });
                this.logger.log(`✅ Blog newsletter broadcast completed successfully`);
            } else {
                this.logger.warn('⚠️ No valid subscriber emails found — newsletter was NOT sent. Check ENCRYPTION_KEY on this server.');
            }
        } catch (error) {
            this.logger.error(`❌ Failed to broadcast newsletter for new post: ${error.message}`, error.stack);
        }
    }

    async remove(id: number) {
        const post = await this.findOne(id);
        return this.blogRepository.remove(post);
    }

    async getPopularTags(): Promise<{ tag: string; count: number }[]> {
        const posts = await this.blogRepository.find({
            where: { status: 'Published' },
            select: ['tags'],
        });

        const tagCounts: Record<string, number> = {};
        for (const post of posts) {
            if (post.tags && Array.isArray(post.tags)) {
                for (const tag of post.tags) {
                    const normalized = tag.trim();
                    if (normalized) {
                        tagCounts[normalized] = (tagCounts[normalized] || 0) + 1;
                    }
                }
            }
        }

        return Object.entries(tagCounts)
            .map(([tag, count]) => ({ tag, count }))
            .sort((a, b) => b.count - a.count);
    }

    async getUniqueCategories(): Promise<string[]> {
        const posts = await this.blogRepository.find({
            where: { status: 'Published' },
            select: ['category'],
        });

        const categories = new Set<string>();
        for (const post of posts) {
            if (post.category) {
                categories.add(post.category);
            }
        }

        return Array.from(categories).sort();
    }

    private async resolveUniqueSlug(titleOrSlug: string, excludeId?: number): Promise<string> {
        let slug = this.formatSlug(titleOrSlug);
        let uniqueSlug = slug;
        let counter = 1;

        while (true) {
            const existing = await this.blogRepository.findOne({
                where: { slug: uniqueSlug }
            });

            if (!existing || (excludeId && existing.id === excludeId)) {
                return uniqueSlug;
            }

            uniqueSlug = `${slug}-${counter}`;
            counter++;
        }
    }

    private formatSlug(text: string): string {
        return text
            .toLowerCase()
            .trim()
            .replace(/[^\w ]+/g, '')
            .replace(/ +/g, '-');
    }
}
