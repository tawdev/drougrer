import { Controller, Get, Post, Delete, Param, Body } from '@nestjs/common';
import { NewsletterService } from './newsletter.service';

@Controller('newsletter')
export class NewsletterController {
    constructor(private readonly newsletterService: NewsletterService) {}

    @Post('subscribe')
    subscribe(@Body('email') email: string) {
        return this.newsletterService.subscribe(email);
    }

    @Get('subscribers')
    findAll() {
        return this.newsletterService.findAll();
    }

    @Get('stats')
    getStats() {
        return this.newsletterService.getStats();
    }

    @Delete('subscribers/:id')
    remove(@Param('id') id: string) {
        return this.newsletterService.remove(+id);
    }
}
