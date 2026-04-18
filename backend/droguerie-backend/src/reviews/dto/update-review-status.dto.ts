import { IsEnum, IsNotEmpty } from 'class-validator';
import { ReviewStatus } from '../review.entity';

export class UpdateReviewStatusDto {
    @IsEnum(ReviewStatus)
    @IsNotEmpty()
    status: ReviewStatus;
}
