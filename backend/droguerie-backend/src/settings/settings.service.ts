import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Setting } from './setting.entity';

@Injectable()
export class SettingsService implements OnModuleInit {
  constructor(
    @InjectRepository(Setting)
    private settingsRepository: Repository<Setting>,
  ) {}

  // Ensure at least one settings row exists on startup
  async onModuleInit() {
    const count = await this.settingsRepository.count();
    if (count === 0) {
      const defaultSettings = this.settingsRepository.create({
        storeName: 'Droguerie Paris Central',
        supportEmail: 'support@droguerie.com',
        phoneNumber: '+33 1 23 45 67 89',
        address: '15 Rue de Rivoli, 75004 Paris, France',
        description: 'MOL Droguerie est votre partenaire de confiance pour tout l\'outillage professionnel, la quincaillerie et les matériaux de construction au Maroc. Nous nous engageons à vous fournir la meilleure qualité au meilleur prix.',
      });
      await this.settingsRepository.save(defaultSettings);
    }
  }

  async getSettings(): Promise<Setting> {
    const settings = await this.settingsRepository.findOne({ where: {} });
    if (!settings) {
      // This should ideally not happen because of onModuleInit, but handles the type error
      throw new Error('Settings not initialized');
    }
    return settings;
  }

  async updateSettings(data: Partial<Setting>): Promise<Setting> {
    const settings = await this.getSettings();
    Object.assign(settings, data);
    return this.settingsRepository.save(settings);
  }
}
