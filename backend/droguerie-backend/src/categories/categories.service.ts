import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './category.entity';

@Injectable()
export class CategoriesService {
    constructor(
        @InjectRepository(Category)
        private readonly categoryRepository: Repository<Category>,
    ) { }

    findAll(): Promise<Category[]> {
        return this.categoryRepository.find({
            relations: ['products', 'children', 'parent'],
            order: { name: 'ASC' }
        });
    }

    async count(): Promise<number> {
        return this.categoryRepository.count();
    }

    async findOne(id: number): Promise<Category | null> {
        return this.categoryRepository.findOne({ where: { id } });
    }

    async findByName(name: string): Promise<Category | null> {
        return this.categoryRepository.findOne({ where: { name } });
    }

    async create(data: { name: string; description?: string; isActive?: boolean; parentId?: number }): Promise<Category> {
        const category = this.categoryRepository.create(data);
        return this.categoryRepository.save(category);
    }

    async update(id: number, data: { name?: string; description?: string; isActive?: boolean; parentId?: number }): Promise<Category> {
        const category = await this.findOne(id);
        if (!category) {
            throw new NotFoundException(`Category with ID ${id} not found`);
        }
        Object.assign(category, data);
        return this.categoryRepository.save(category);
    }

    async remove(id: number): Promise<void> {
        const result = await this.categoryRepository.delete(id);
        if (result.affected === 0) {
            throw new NotFoundException(`Category with ID ${id} not found`);
        }
    }

    async getDescendantIds(parentId: number): Promise<number[]> {
        const children = await this.categoryRepository.find({ where: { parentId } });
        let ids = [parentId];
        for (const child of children) {
            const childIds = await this.getDescendantIds(child.id);
            ids = [...ids, ...childIds];
        }
        return Array.from(new Set(ids));
    }
}
