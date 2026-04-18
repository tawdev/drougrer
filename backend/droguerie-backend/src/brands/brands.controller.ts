import { Controller, Get, Post, Patch, Delete, Body, Param, ParseIntPipe } from '@nestjs/common';
import { BrandsService } from './brands.service';
import { CreateBrandDto, UpdateBrandDto } from './dto/create-brand.dto';

@Controller('brands')
export class BrandsController {
    constructor(private readonly brandsService: BrandsService) { }

    @Get()
    findAll() {
        return this.brandsService.findAll();
    }

    @Get('active')
    findActive() {
        return this.brandsService.findActive();
    }

    @Post()
    create(@Body() data: CreateBrandDto) {
        return this.brandsService.create(data);
    }

    @Patch(':id')
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body() data: UpdateBrandDto,
    ) {
        return this.brandsService.update(id, data);
    }

    @Delete(':id')
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.brandsService.remove(id);
    }
}
