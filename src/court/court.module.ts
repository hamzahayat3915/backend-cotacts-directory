import { Module } from '@nestjs/common';
import { CourtService } from './court.service';
import { CourtController } from './court.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CourtEntity } from './court.entity/court.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CourtEntity])],
  providers: [CourtService],
  controllers: [CourtController]
})
export class CourtModule {}
