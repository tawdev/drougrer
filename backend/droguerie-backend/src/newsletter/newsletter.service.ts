import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NewsletterSubscriber } from './newsletter-subscriber.entity';
import * as crypto from 'crypto';
import { MailService } from '../mail/mail.service';

@Injectable()
export class NewsletterService {
    constructor(
        @InjectRepository(NewsletterSubscriber)
        private subscriberRepo: Repository<NewsletterSubscriber>,
        private mailService: MailService,
    ) {}

    /**
     * Generates a deterministic hash for searching encrypted emails.
     * Reuses the ENCRYPTION_KEY as a secret for the HMAC.
     */
    private generateHash(email: string): string {
        const secret = process.env.ENCRYPTION_KEY || 'default-secret-for-hash';
        return crypto
            .createHmac('sha256', secret)
            .update(email.toLowerCase().trim())
            .digest('hex');
    }

    async subscribe(email: string): Promise<NewsletterSubscriber> {
        const emailHash = this.generateHash(email);
        
        // Search by hash instead of raw email (since raw is now encrypted in DB)
        const existing = await this.subscriberRepo.findOne({ where: { emailHash } });
        if (existing) {
            throw new ConflictException('This email is already subscribed.');
        }

        const subscriber = this.subscriberRepo.create({ 
            email,
            emailHash 
        });
        const saved = await this.subscriberRepo.save(subscriber);

        // Send welcome email (asynchronous, don't wait for it to block the response)
        this.mailService.sendWelcomeEmail(email).catch(err => {
            console.error('📢 Failed to send welcome newsletter email:', err.message);
        });

        return saved;
    }

    async findAll(): Promise<NewsletterSubscriber[]> {
        return this.subscriberRepo.find({ order: { subscribedAt: 'DESC' } });
    }

    async findAllEmails(): Promise<string[]> {
        const subscribers = await this.subscriberRepo.find();
        return subscribers.map(s => s.email);
    }

    async getStats(): Promise<{ count: number }> {
        const count = await this.subscriberRepo.count();
        return { count };
    }

    async remove(id: number): Promise<void> {
        await this.subscriberRepo.delete(id);
    }
}
