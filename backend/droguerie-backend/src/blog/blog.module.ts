import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BlogService } from './blog.service';
import { BlogController } from './blog.controller';
import { BlogPost } from './blog-post.entity';
import { NewsletterModule } from '../newsletter/newsletter.module';
import { MailModule } from '../mail/mail.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([BlogPost]),
        NewsletterModule,
        MailModule,
    ],
    controllers: [BlogController],
    providers: [BlogService],
    exports: [BlogService],
})
export class BlogModule { }
