import { Controller, Get, Post, Patch, Param, Body, Query, UseGuards } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { Order } from './order.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('orders')
export class OrdersController {
    constructor(private readonly ordersService: OrdersService) { }

    @UseGuards(JwtAuthGuard)
    @Get()
    findAll(
        @Query('page') page = '1',
        @Query('limit') limit = '10',
        @Query('status') status?: string,
        @Query('search') search?: string,
    ) {
        return this.ordersService.findAll(Number(page), Number(limit), status, search);
    }

    @UseGuards(JwtAuthGuard)
    @Get('stats')
    getStats() {
        return this.ordersService.getStats();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.ordersService.findOne(Number(id));
    }

    @Post() // Keep public for customers
    create(@Body() orderData: CreateOrderDto) {
        return this.ordersService.create(orderData);
    }

    @UseGuards(JwtAuthGuard)
    @Patch(':id/status')
    updateStatus(
        @Param('id') id: string,
        @Body() updateDto: UpdateOrderStatusDto,
    ) {
        return this.ordersService.updateStatus(Number(id), updateDto.status, updateDto.email);
    }

    @UseGuards(JwtAuthGuard)
    @Post(':id/resend-invoice')
    resendInvoice(@Param('id') id: string) {
        return this.ordersService.resendInvoice(Number(id));
    }
}
