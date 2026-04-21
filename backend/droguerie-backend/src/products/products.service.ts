import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual, Like } from 'typeorm';
import { Product } from './product.entity';
import { Category } from '../categories/category.entity';
import { CategoriesService } from '../categories/categories.service';
import { CreateProductDto, UpdateProductDto } from './dto/create-product.dto';

@Injectable()
export class ProductsService {
    constructor(
        @InjectRepository(Product)
        private readonly productRepository: Repository<Product>,
        private readonly categoriesService: CategoriesService,
    ) { }

    async findAll(
        page = 1,
        limit = 10,
        search?: string,
        categoryId?: number,
        brandId?: number,
        minPrice?: number,
        maxPrice?: number,
        inStock?: boolean,
        onSale?: boolean,
        ecoFriendly?: boolean,
        sort?: string,
        activeOnly = false,
    ): Promise<{ data: Product[]; total: number; page: number; totalPages: number }> {
        const qb = this.productRepository.createQueryBuilder('product');

        if (activeOnly) {
            qb.innerJoinAndSelect('product.category', 'category', 'category.isActive = :catIsActive', { catIsActive: true });
        } else {
            qb.leftJoinAndSelect('product.category', 'category');
        }
        qb.leftJoinAndSelect('product.brand', 'brand');

        if (search) {
            qb.andWhere('(product.name LIKE :search OR product.sku LIKE :search)', { search: `%${search}%` });
        }
        if (categoryId) {
            const categoryIds = await this.categoriesService.getDescendantIds(categoryId);
            qb.andWhere('product.categoryId IN (:...categoryIds)', { categoryIds });
        }
        if (brandId) {
            qb.andWhere('product.brandId = :brandId', { brandId });
        }
        if (minPrice !== undefined) {
            qb.andWhere('product.price >= :minPrice', { minPrice });
        }
        if (maxPrice !== undefined) {
            qb.andWhere('product.price <= :maxPrice', { maxPrice });
        }
        if (inStock) {
            qb.andWhere('product.stock > 0');
        }
        if (onSale) {
            qb.andWhere('product.onSale = :onSale', { onSale: true });
        }
        if (ecoFriendly) {
            qb.andWhere('product.ecoFriendly = :ecoFriendly', { ecoFriendly: true });
        }

        if (sort === 'priceAsc') {
            qb.orderBy('product.price', 'ASC');
        } else if (sort === 'priceDesc') {
            qb.orderBy('product.price', 'DESC');
        } else if (sort === 'popularity') {
            qb.orderBy('product.stock', 'ASC'); // proxy for popularity
        } else {
            qb.orderBy('product.createdAt', 'DESC'); // newest
        }

        qb.skip((page - 1) * limit).take(limit);

        const [data, total] = await qb.getManyAndCount();

        return { data, total, page, totalPages: Math.ceil(total / limit) };
    }

    async getStats(): Promise<{
        total: number;
        lowStock: number;
        outOfStock: number;
        active: number;
    }> {
        const total = await this.productRepository.count();
        const outOfStock = await this.productRepository.count({ where: { stock: 0 } });
        const lowStock = await this.productRepository.count({
            where: { stock: LessThanOrEqual(10) },
        });
        // lowStock includes outOfStock, so subtract
        const active = total - outOfStock;
        return { total, lowStock: lowStock - outOfStock, outOfStock, active };
    }

    async create(data: CreateProductDto): Promise<Product> {
        const product = this.productRepository.create(data);
        return this.productRepository.save(product);
    }

    async findOne(id: number): Promise<Product | null> {
        return this.productRepository.findOne({
            where: { id },
            relations: ['category', 'brand'],
        });
    }

    async update(id: number, data: UpdateProductDto): Promise<Product> {
        let product = await this.findOne(id);
        if (!product) {
            throw new Error('Product not found');
        }

        Object.assign(product, data);
        return this.productRepository.save(product);
    }

    async remove(id: number): Promise<void> {
        console.log('DELETING PRODUCT ID:', id);
        const result = await this.productRepository.delete(id);
        console.log('DELETE RESULT:', result);
    }

    async getUniqueTags(): Promise<string[]> {
        const products = await this.productRepository.createQueryBuilder('product')
            .select('product.tags')
            .where('product.tags IS NOT NULL')
            .getMany();

        const allTags = products.reduce((acc, p) => {
            if (p.tags && p.tags.length > 0) {
                return [...acc, ...p.tags];
            }
            return acc;
        }, [] as string[]);

        return Array.from(new Set(allTags)).sort();
    }

    async seed(): Promise<void> {
        const products = [
            { name: 'ProSeries 18V Brushless Compact Drill', price: 249.99, stock: 45, categoryName: 'Power Tools', sku: 'DRILL-001', imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAiE3i46Eqf8R2WeVxJ9ZLbiFSlepkgaHoKGzFza8ObaQRQTr4wZGwBsZ5jeRM2jo9s3xJ1zUdO-OjQh7-9UChC4t2J7W2ApPkq3LjC4FhW13M6y7K40E8gUE8Pjjwwi08lt0N2f1zwG1bLbHbQRrgMK0idHCvwePUFeMB1i7iYdQv9wVnkUsnQDu_9m-Oj-tFEVaitMD37Yx_aEe3yDzNx32bWY0fE2GOal9lJdHAQXhGApV3b9bktCMFjMnv322J187ClAWeSkLQ' },
            { name: 'Titanium Bit Set (45-pc)', price: 45.50, stock: 120, categoryName: 'Power Tools', sku: 'BITS-045', imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDT-nNAOz4Urbe0dmOC2YdeRAkgbApoB2NXtG4jfnfXJRnYUEU8n_q6fxi51Z2iR4nJDgTRy-omkbyMRCNsmoN8NmPrn48_Ur5zM8innQqsHsskCHoE0C-4hc59ZB3L9GiC899ll9mmA721QM7CZ9o1nq1xuI1t68j4xWUcIl_wIbR0M3omLxf4fol55get4PAVCGgphF8rUOxDyhQ-tkAAQi_hFT-vR_jkuRH6AYegZhQY3X6A8Nu3rUi9THmqeGitIGfwUg_nir0' },
            { name: 'Eco-Clean Multi-Purpose Spray', price: 12.50, stock: 85, categoryName: 'Cleaning', sku: 'CLN-001', imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD8ASA5jZmdzaqmuDPAqIjG4viKhQQLRP4V0QdZW_uJ-nOiMOpIXhrCJwN3n7d3qfi-N_kkHNt1BmWO0AizzMJVgo9ab3bm0czJHg7FB2xkXdPEIWdQSyjmD97adzRArM2lggzO0IsB7zG3c8fHv2ONW0DS82Sg7GfmjyfFDYVsw_-HEUrz5N6FE88zKAYnX5OYybUnJ-GxnU1Sok6akVx-y75-0bxqdFu_tT6kTJqLLD_ON9ub_2RHxyMDDTc2i0hHYVbFpikVxVk' },
            { name: 'Natural Bamboo Toothbrush', price: 8.99, stock: 200, categoryName: 'Personal Care', sku: 'PC-001', imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCq3SbJjUn3mBt0nPyog1JCUJ3ciG1db0szWh1oCC30tea6CSgY54RRCuP48kWNAabn-Evs_Ypgu3mIqPhgmbkvS5JAKuUSN9POefyuLdOLczg4wIf0o9BMobcXyTltd4XwU_JWYbceCvIWYgtk0NtAzAwlG5ZN0g4TW3Sv0HsGML24DOooYZx79r7E2AvPr-AS1bGlCK_mBe5QMOhuJqIr3yi7z-BFRQsw8aAB1pGttOhnYo7ZWZm4WcYwQiHS6nPtEbakqVpyTiA' },
            { name: 'Heavy Duty Steel Hammer', price: 29.99, stock: 30, categoryName: 'Hand Tools', sku: 'HAM-001', imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA-l9-5z_2f-rS3jSYr4s0fM7-V9e_X_q6fxi51Z2iR4nJDgTRy-omkbyMRCNsmoN8NmPrn48_Ur5zM8innQqsHsskCHoE0C-4hc59ZB3L9GiC899ll9mmA721QM7CZ9o1nq1xuI1t68j4xWUcIl_wIbR0M3omLxf4fol55get4PAVCGgphF8rUOxDyhQ-tkAAQi_hFT-vR_jkuRH6AYegZhQY3X6A8Nu3rUi9THmqeGitIGfwUg_nir0' },
        ];

        for (const p of products) {
            const exists = await this.productRepository.findOne({ where: { name: p.name } });
            if (!exists) {
                await this.create(p);
            }
        }
    }
}
