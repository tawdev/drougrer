import { Injectable, ConflictException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NewsletterSubscriber } from './newsletter-subscriber.entity';
import * as crypto from 'crypto';
import { MailService } from '../mail/mail.service';

@Injectable()
export class NewsletterService {
    private readonly logger = new Logger(NewsletterService.name);

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

    /**
     * Simple email format validation to detect un-decrypted or corrupted emails.
     */
    private isValidEmail(email: string): boolean {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
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
            this.logger.error('📢 Failed to send welcome newsletter email:', err.message);
        });

        return saved;
    }

    async findAll(): Promise<NewsletterSubscriber[]> {
        return this.subscriberRepo.find({ order: { subscribedAt: 'DESC' } });
    }

    async findAllEmails(): Promise<string[]> {
        const subscribers = await this.subscriberRepo.find();
        
        const validEmails: string[] = [];
        let skippedCount = 0;

        for (const s of subscribers) {
            if (this.isValidEmail(s.email)) {
                validEmails.push(s.email);
            } else {
                skippedCount++;
                this.logger.warn(
                    `⚠️ Skipping subscriber #${s.id}: email could not be decrypted (got "${s.email?.substring(0, 15)}..."). ` +
                    `Check that ENCRYPTION_KEY matches the one used when this email was stored.`
                );
            }
        }

        if (skippedCount > 0) {
            this.logger.error(
                `❌ ${skippedCount}/${subscribers.length} subscriber emails could NOT be decrypted. ` +
                `ENCRYPTION_KEY mismatch between local and production? ` +
                `Current key starts with: ${(process.env.ENCRYPTION_KEY || 'MISSING').substring(0, 8)}...`
            );
        }

        this.logger.log(`📧 Found ${validEmails.length} valid emails out of ${subscribers.length} subscribers`);
        return validEmails;
    }

    async getStats(): Promise<{ count: number }> {
        const count = await this.subscriberRepo.count();
        return { count };
    }

    async remove(id: number): Promise<void> {
        await this.subscriberRepo.delete(id);
    }
}
