import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HealthFacility } from './entities/health-facility.entity';
import { Specialty } from './entities/specialty.entity';
import { Doctor } from './entities/doctor.entity';

@Module({
  imports: [TypeOrmModule.forFeature([HealthFacility, Specialty, Doctor])],
  exports: [TypeOrmModule],
})
export class HealthcareModule {}
