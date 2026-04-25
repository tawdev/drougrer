import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Category } from './categories/category.entity';
import { Product } from './products/product.entity';
import { Order } from './orders/order.entity';
import { User } from './users/entities/user.entity';
import { CategoriesModule } from './categories/categories.module';
import { ProductsModule } from './products/products.module';
import { OrdersModule } from './orders/orders.module';
import { UploadModule } from './upload/upload.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { BlogPost } from './blog/blog-post.entity';
import { BlogModule } from './blog/blog.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { Brand } from './brands/brand.entity';
import { BrandsModule } from './brands/brands.module';
import { NewsletterSubscriber } from './newsletter/newsletter-subscriber.entity';
import { NewsletterModule } from './newsletter/newsletter.module';
import { Tip } from './tips/tip.entity';
import { TipsModule } from './tips/tips.module';
import { Setting } from './settings/setting.entity';
import { SettingsModule } from './settings/settings.module';
import { Review } from './reviews/review.entity';
import { ReviewsModule } from './reviews/reviews.module';


@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'uploads'),
      serveRoot: '/uploads',
    }),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_NAME'),
        entities: [Category, Product, Order, User, BlogPost, Brand, NewsletterSubscriber, Tip, Setting, Review],
        synchronize: true, // WARNING: Set to false in production once you have real data & migrations!

      }),
      inject: [ConfigService],
    }),
    CategoriesModule,
    ProductsModule,
    OrdersModule,
    UploadModule,
    AuthModule,
    UsersModule,
    BlogModule,
    AnalyticsModule,
    BrandsModule,
    NewsletterModule,
    TipsModule,
    SettingsModule,
    ReviewsModule,
  ],

  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
