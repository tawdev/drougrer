import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalyticsService } from './analytics.service';
import { AnalyticsController } from './analytics.controller';
import { Order } from '../orders/order.entity';
import { Product } from '../products/product.entity';
import { Category } from '../categories/category.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Order, Product, Category])],
    controllers: [AnalyticsController],
    providers: [AnalyticsService],
})
export class AnalyticsModule { }
