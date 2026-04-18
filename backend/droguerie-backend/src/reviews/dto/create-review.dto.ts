import { IsString, IsNumber, Min, Max, IsNotEmpty } from 'class-validator';

export class CreateReviewDto {
    @IsNumber()
    @IsNotEmpty()
    productId: number;

    @IsString()
    @IsNotEmpty()
    name: string;

    @IsNumber()
    @Min(1)
    @Max(5)
    rating: number;

    @IsString()
    @IsNotEmpty()
    comment: string;
}
