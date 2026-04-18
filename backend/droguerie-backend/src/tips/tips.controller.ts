import { Controller, Get, Post, Patch, Delete, Param, Body } from '@nestjs/common';
import { TipsService } from './tips.service';
import { Tip } from './tip.entity';

@Controller('tips')
export class TipsController {
    constructor(private readonly tipsService: TipsService) {}

    @Get()
    findAll() {
        return this.tipsService.findAll();
    }

    @Get('active')
    findActive() {
        return this.tipsService.findActive();
    }

    @Post()
    create(@Body() data: Partial<Tip>) {
        return this.tipsService.create(data);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() data: Partial<Tip>) {
        return this.tipsService.update(+id, data);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.tipsService.remove(+id);
    }
}
