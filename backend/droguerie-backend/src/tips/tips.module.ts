import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tip } from './tip.entity';
import { TipsService } from './tips.service';
import { TipsController } from './tips.controller';
import { NewsletterModule } from '../newsletter/newsletter.module';
import { MailModule } from '../mail/mail.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Tip]),
        NewsletterModule,
        MailModule,
    ],
    controllers: [TipsController],
    providers: [TipsService],
    exports: [TipsService],
})
export class TipsModule {}
