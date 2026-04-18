import { Controller, Get, Patch, Body, UseGuards } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { Setting } from './setting.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  async getSettings(): Promise<Setting> {
    return this.settingsService.getSettings();
  }

  @UseGuards(JwtAuthGuard)
  @Patch()
  async updateSettings(@Body() data: Partial<Setting>): Promise<Setting> {
    return this.settingsService.updateSettings(data);
  }
}
