import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order, OrderStatus } from './order.entity';
import { MailService } from '../mail/mail.service';
import { PdfService } from './pdf.service';
import { CreateOrderDto } from './dto/create-order.dto';

@Injectable()
export class OrdersService {
    constructor(
        @InjectRepository(Order)
        private readonly orderRepository: Repository<Order>,
        private readonly mailService: MailService,
        private readonly pdfService: PdfService,
    ) { }

    async findAll(
        page = 1,
        limit = 10,
        status?: string,
        search?: string,
    ): Promise<{ data: Order[]; total: number; page: number; totalPages: number }> {
        const qb = this.orderRepository.createQueryBuilder('order');

        if (status && Object.values(OrderStatus).includes(status as OrderStatus)) {
            qb.andWhere('order.status = :status', { status });
        }

        if (search) {
            qb.andWhere(
                '(order.customerName LIKE :search OR order.email LIKE :search OR order.invoiceReference LIKE :search)',
                { search: `%${search}%` },
            );
        }

        qb.orderBy('order.createdAt', 'DESC')
            .skip((page - 1) * limit)
            .take(limit);

        const [data, total] = await qb.getManyAndCount();
        return { data, total, page, totalPages: Math.ceil(total / limit) };
    }

    async getStats(): Promise<{
        total: number;
        pending: number;
        revenue: number;
        inTransit: number;
        todayCount: number;
    }> {
        const total = await this.orderRepository.count();
        const pending = await this.orderRepository.count({
            where: { status: OrderStatus.PENDING },
        });

        // In Transit = Confirmed OR Processing
        const inTransit = await this.orderRepository
            .createQueryBuilder('order')
            .where('order.status IN (:...statuses)', {
                statuses: [OrderStatus.CONFIRMED, OrderStatus.PROCESSING]
            })
            .getCount();

        // Revenue is sum of all COMPLETED orders
        const revenueResult = await this.orderRepository
            .createQueryBuilder('order')
            .select('SUM(order.totalPrice)', 'revenue')
            .where('order.status = :status', { status: OrderStatus.COMPLETED })
            .getRawOne<{ revenue: string }>();
        const revenue = parseFloat(revenueResult?.revenue || '0');

        // Orders created today
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayCount = await this.orderRepository
            .createQueryBuilder('order')
            .where('order.createdAt >= :today', { today })
            .getCount();

        return { total, pending, revenue, inTransit, todayCount };
    }

    async findOne(id: number): Promise<Order> {
        const order = await this.orderRepository.findOne({ where: { id } });
        if (!order) {
            throw new NotFoundException(`Order with ID ${id} not found`);
        }
        return order;
    }

    async create(orderData: CreateOrderDto): Promise<Order> {
        const order = this.orderRepository.create(orderData);
        // Default to PENDING if not provided
        if (!order.status) {
            order.status = OrderStatus.PENDING;
        }

        const savedOrder = await this.orderRepository.save(order);

        // TRIGGER ADMIN NOTIFICATION WITH PDF
        try {
            const pdfBuffer = await this.pdfService.generateOrderPdf(savedOrder);
            await this.mailService.sendAdminOrderNotification(savedOrder, pdfBuffer);
        } catch (error) {
            // Log but don't fail order creation
            console.error('Failed to send admin notification:', error);
        }

        return savedOrder;
    }

    async updateStatus(id: number, status: OrderStatus, email?: string): Promise<Order> {
        const order = await this.orderRepository.findOne({ where: { id } });
        if (!order) {
            throw new NotFoundException(`Order with ID ${id} not found`);
        }

        // Update email if provided
        if (email) {
            order.email = email;
        }

        const oldStatus = order.status;
        order.status = status;

        // Validation: If confirming, an email is REQUIRED
        if (status === OrderStatus.CONFIRMED && !order.email) {
            throw new Error('Impossible de confirmer la commande sans adresse email.');
        }

        const savedOrder = await this.orderRepository.save(order);

        // TRIGGER EMAIL: Send invoice when moving to CONFIRMED
        if (status === OrderStatus.CONFIRMED && oldStatus !== OrderStatus.CONFIRMED) {
            await this.mailService.sendInvoice(savedOrder);
        }

        return savedOrder;
    }

    async resendInvoice(id: number): Promise<{ success: boolean; message: string }> {
        const order = await this.findOne(id);

        if (!order.email) {
            throw new Error('Aucune adresse email associée à cette commande.');
        }

        await this.mailService.sendInvoice(order);
        return { success: true, message: 'Facture renvoyée avec succès.' };
    }
}
