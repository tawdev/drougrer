import { Controller, Get, Post, Patch, Delete, Body, Param, ParseIntPipe, Query } from '@nestjs/common';
import { CategoriesService } from './categories.service';

@Controller('categories')
export class CategoriesController {
    constructor(private readonly categoriesService: CategoriesService) { }

    @Get()
    findAll(@Query('active') active?: string) {
        const activeOnly = active === 'true';
        return this.categoriesService.findAll(activeOnly);
    }

    @Get('count')
    async count() {
        const total = await this.categoriesService.count();
        return { total };
    }

    @Post()
    create(@Body() data: { name: string; description?: string; isActive?: boolean; parentId?: number }) {
        return this.categoriesService.create(data);
    }

    @Patch(':id')
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body() data: { name?: string; description?: string; isActive?: boolean; parentId?: number },
    ) {
        return this.categoriesService.update(id, data);
    }

    @Delete(':id')
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.categoriesService.remove(id);
    }
}
