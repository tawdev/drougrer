import { Controller, Get, Post, Body, Query, Param, Patch, Delete, NotFoundException, UsePipes, ValidationPipe } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto, UpdateProductDto } from './dto/create-product.dto';

@Controller('products')
export class ProductsController {
    constructor(private readonly productsService: ProductsService) { }

    @Get()
    findAll(
        @Query('page') page = '1',
        @Query('limit') limit = '12',
        @Query('search') search?: string,
        @Query('categoryId') categoryId?: string,
        @Query('brandId') brandId?: string,
        @Query('minPrice') minPrice?: string,
        @Query('maxPrice') maxPrice?: string,
        @Query('inStock') inStock?: string,
        @Query('onSale') onSale?: string,
        @Query('ecoFriendly') ecoFriendly?: string,
        @Query('sort') sort?: string,
        @Query('active') active?: string,
    ) {
        return this.productsService.findAll(
            Number(page),
            Number(limit),
            search,
            categoryId ? Number(categoryId) : undefined,
            brandId ? Number(brandId) : undefined,
            minPrice !== undefined ? Number(minPrice) : undefined,
            maxPrice !== undefined ? Number(maxPrice) : undefined,
            inStock === 'true',
            onSale === 'true',
            ecoFriendly === 'true',
            sort,
            active === 'true'
        );
    }

    @Get('stats')
    getStats() {
        return this.productsService.getStats();
    }

    @Post('seed')
    seed() {
        return this.productsService.seed();
    }

    @Get('tags')
    getTags() {
        return this.productsService.getUniqueTags();
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        const product = await this.productsService.findOne(Number(id));
        if (!product) throw new NotFoundException(`Product with ID ${id} not found`);
        return product;
    }

    @Post()
    @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
    create(@Body() data: CreateProductDto) {
        return this.productsService.create(data);
    }

    @Patch(':id')
    @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
    async update(@Param('id') id: string, @Body() data: UpdateProductDto) {
        try {
            return await this.productsService.update(Number(id), data);
        } catch (err) {
            throw new NotFoundException(err.message);
        }
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.productsService.remove(Number(id));
    }
}
