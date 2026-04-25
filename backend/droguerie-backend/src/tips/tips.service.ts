import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tip } from './tip.entity';
import { NewsletterService } from '../newsletter/newsletter.service';
import { MailService } from '../mail/mail.service';

@Injectable()
export class TipsService {
    private readonly logger = new Logger(TipsService.name);
    constructor(
        @InjectRepository(Tip)
        private tipRepo: Repository<Tip>,
        private newsletterService: NewsletterService,
        private mailService: MailService,
    ) {}

    async findAll(): Promise<Tip[]> {
        return this.tipRepo.find({ order: { createdAt: 'DESC' } });
    }

    async findActive(): Promise<Tip | null> {
        return this.tipRepo.findOne({ where: { isActive: true }, order: { createdAt: 'DESC' } });
    }

    async create(data: Partial<Tip>): Promise<Tip> {
        // If setting this tip as active, deactivate all others
        if (data.isActive) {
            await this.tipRepo.update({ isActive: true }, { isActive: false });
        }
        const tip = this.tipRepo.create(data);
        const savedTip = await this.tipRepo.save(tip);

        if (savedTip.isActive) {
            this.notifySubscribers(savedTip);
        }

        return savedTip;
    }

    async update(id: number, data: Partial<Tip>): Promise<Tip> {
        const tip = await this.tipRepo.findOne({ where: { id } });
        if (!tip) throw new NotFoundException(`Tip with ID ${id} not found`);
        const oldActive = tip.isActive;

        // If setting this tip as active, deactivate all others
        if (data.isActive) {
            await this.tipRepo.update({ isActive: true }, { isActive: false });
        }
        Object.assign(tip, data);
        const updatedTip = await this.tipRepo.save(tip);

        // Notify if activated
        if (!oldActive && updatedTip.isActive) {
            this.notifySubscribers(updatedTip);
        }

        return updatedTip;
    }

    private async notifySubscribers(tip: Tip) {
        try {
            const emails = await this.newsletterService.findAllEmails();
            this.logger.log(`📢 Broadcasting tip "${tip.authorName}" to ${emails.length} subscribers...`);
            if (emails.length > 0) {
                await this.mailService.sendNewsletterNotification(emails, {
                    title: `Astuce de ${tip.authorName}`,
                    excerpt: tip.content.substring(0, 150) + '...',
                    type: 'TIP',
                });
                this.logger.log(`✅ Tip newsletter broadcast completed successfully`);
            } else {
                this.logger.warn('⚠️ No valid subscriber emails found — newsletter was NOT sent. Check ENCRYPTION_KEY on this server.');
            }
        } catch (error) {
            this.logger.error(`❌ Failed to broadcast newsletter for new tip: ${error.message}`, error.stack);
        }
    }

    async remove(id: number): Promise<void> {
        const tip = await this.tipRepo.findOne({ where: { id } });
        if (!tip) throw new NotFoundException(`Tip with ID ${id} not found`);
        await this.tipRepo.remove(tip);
    }
}
