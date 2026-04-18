import { Injectable, NotFoundException, ConflictException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Brand } from './brand.entity';
import { CreateBrandDto, UpdateBrandDto } from './dto/create-brand.dto';

@Injectable()
export class BrandsService {
    constructor(
        @InjectRepository(Brand)
        private readonly brandRepository: Repository<Brand>,
    ) { }

    findAll(): Promise<Brand[]> {
        return this.brandRepository.find({ order: { name: 'ASC' } });
    }

    findActive(): Promise<Brand[]> {
        return this.brandRepository.find({
            where: { isActive: true },
            order: { name: 'ASC' },
        });
    }

    async findOne(id: number): Promise<Brand | null> {
        return this.brandRepository.findOne({ where: { id } });
    }

    async create(data: CreateBrandDto): Promise<Brand> {
        try {
            const brand = this.brandRepository.create(data);
            return await this.brandRepository.save(brand);
        } catch (error: any) {
            if (error.code === 'ER_DUP_ENTRY' || error.errno === 1062) {
                throw new ConflictException(`La marque "${data.name}" existe déjà.`);
            }
            console.error('Error creating brand:', error);
            throw new InternalServerErrorException('Une erreur est survenue lors de la création de la marque.');
        }
    }

    async update(id: number, data: UpdateBrandDto): Promise<Brand> {
        const brand = await this.findOne(id);
        if (!brand) {
            throw new NotFoundException(`Brand with ID ${id} not found`);
        }
        
        try {
            Object.assign(brand, data);
            return await this.brandRepository.save(brand);
        } catch (error: any) {
            if (error.code === 'ER_DUP_ENTRY' || error.errno === 1062) {
                throw new ConflictException(`Une marque avec le nom "${data.name}" existe déjà.`);
            }
            console.error('Error updating brand:', error);
            throw new InternalServerErrorException('Une erreur est survenue lors de la mise à jour de la marque.');
        }
    }

    async remove(id: number): Promise<void> {
        try {
            const result = await this.brandRepository.delete(id);
            if (result.affected === 0) {
                throw new NotFoundException(`Brand with ID ${id} not found`);
            }
        } catch (error: any) {
            // MySQL/MariaDB Error 1451: Cannot delete or update a parent row: a foreign key constraint fails
            if (error.code === 'ER_ROW_IS_REFERENCED_2' || error.errno === 1451) {
                throw new ConflictException('Impossible de supprimer cette marque car elle est associée à un ou plusieurs produits.');
            }
            console.error('Error deleting brand:', error);
            throw new InternalServerErrorException('Une erreur est survenue lors de la suppression de la marque.');
        }
    }
}
