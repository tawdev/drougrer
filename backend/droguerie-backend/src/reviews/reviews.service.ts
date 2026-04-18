import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review, ReviewStatus } from './review.entity';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewStatusDto } from './dto/update-review-status.dto';

@Injectable()
export class ReviewsService {
    constructor(
        @InjectRepository(Review)
        private readonly reviewRepository: Repository<Review>,
    ) {}

    async create(createReviewDto: CreateReviewDto): Promise<Review> {
        const review = this.reviewRepository.create({
            ...createReviewDto,
            status: ReviewStatus.PENDING, // Force pending via logic as well as schema
        });
        return this.reviewRepository.save(review);
    }

    async findAll(status?: string): Promise<Review[]> {
        const query = this.reviewRepository.createQueryBuilder('review')
            .leftJoinAndSelect('review.product', 'product')
            .orderBy('review.createdAt', 'DESC');
            
        if (status) {
            query.where('review.status = :status', { status });
        }
        
        return query.getMany();
    }

    async findByProduct(productId: number, status: ReviewStatus = ReviewStatus.APPROVED): Promise<Review[]> {
        return this.reviewRepository.find({
            where: { productId, status },
            order: { createdAt: 'DESC' },
        });
    }

    async updateStatus(id: number, updateReviewStatusDto: UpdateReviewStatusDto): Promise<Review> {
        const review = await this.reviewRepository.findOne({ where: { id } });
        if (!review) {
            throw new NotFoundException(`Review with ID ${id} not found`);
        }
        
        review.status = updateReviewStatusDto.status;
        return this.reviewRepository.save(review);
    }

    async remove(id: number): Promise<void> {
        const result = await this.reviewRepository.delete(id);
        if (result.affected === 0) {
            throw new NotFoundException(`Review with ID ${id} not found`);
        }
    }
}
