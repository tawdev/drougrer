import { Controller, Get, Post, Body, Param, Patch, Delete, Query, UsePipes, ValidationPipe } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewStatusDto } from './dto/update-review-status.dto';
import { ReviewStatus } from './review.entity';

@Controller('reviews')
export class ReviewsController {
    constructor(private readonly reviewsService: ReviewsService) {}

    // Public: Submit a review
    @Post()
    @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
    create(@Body() createReviewDto: CreateReviewDto) {
        return this.reviewsService.create(createReviewDto);
    }

    // Admin: Get all reviews (optionally filtering by status: pending, approved, rejected)
    @Get()
    findAll(@Query('status') status?: string) {
        return this.reviewsService.findAll(status);
    }

    // Public: Get *only approved* reviews for a specific product
    @Get('product/:productId')
    findByProduct(@Param('productId') productId: string) {
        return this.reviewsService.findByProduct(Number(productId), ReviewStatus.APPROVED);
    }

    // Admin: Update status (approve/reject)
    @Patch(':id/status')
    @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
    updateStatus(@Param('id') id: string, @Body() updateReviewStatusDto: UpdateReviewStatusDto) {
        return this.reviewsService.updateStatus(Number(id), updateReviewStatusDto);
    }

    // Admin: Delete review
    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.reviewsService.remove(Number(id));
    }
}
