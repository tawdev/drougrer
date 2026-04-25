import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './order.entity';
import { Product } from '../products/product.entity';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { MailModule } from '../mail/mail.module';
import { PdfService } from './pdf.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([Order, Product]),
        MailModule
    ],
    controllers: [OrdersController],
    providers: [OrdersService, PdfService],
    exports: [OrdersService, PdfService],
})
export class OrdersModule { }
