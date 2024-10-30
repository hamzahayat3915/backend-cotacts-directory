// court.controller.ts
import { Controller, Get, Post, Put, Delete, Param, Body } from '@nestjs/common';
import { CourtService } from './court.service';
import { CourtEntity } from './court.entity/court.entity';

@Controller('courts')
export class CourtController {
    constructor(private readonly courtService: CourtService) {}

    @Post()
    async create(@Body('name') name: string): Promise<CourtEntity> {
        return this.courtService.create(name);
    }

    @Get()
    async findAll(): Promise<CourtEntity[]> {
        return this.courtService.findAll();
    }

    @Get(':id')
    async findOne(@Param('id') id: number): Promise<CourtEntity> {
        return this.courtService.findOne(id);
    }

    @Put(':id')
    async update(@Param('id') id: number, @Body('name') name: string): Promise<CourtEntity> {
        return this.courtService.update(id, name);
    }

    @Delete(':id')
    async delete(@Param('id') id: number): Promise<void> {
        await this.courtService.delete(id);
    }
}
