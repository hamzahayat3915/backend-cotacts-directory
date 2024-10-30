// court.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CourtEntity } from './court.entity/court.entity';

@Injectable()
export class CourtService {
    constructor(
        @InjectRepository(CourtEntity)
        private readonly courtRepository: Repository<CourtEntity>,
    ) {}

    async create(name: string): Promise<CourtEntity> {
        const court = this.courtRepository.create({ name });
        return this.courtRepository.save(court);
    }

    async findAll(): Promise<CourtEntity[]> {
        return this.courtRepository.find();
    }

    async findOne(id: number): Promise<CourtEntity> {
        const court = await this.courtRepository.findOne({ where: { id } });
        if (!court) throw new NotFoundException(`Court with ID ${id} not found`);
        return court;
    }

    async update(id: number, name: string): Promise<CourtEntity> {
        const court = await this.findOne(id);
        court.name = name;
        return this.courtRepository.save(court);
    }

    async delete(id: number): Promise<void> {
        await this.courtRepository.delete(id);
    }
}
