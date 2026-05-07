import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Patient } from './entities/patient.entity';
import { HealthProfile } from './entities/health-profile.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Patient, HealthProfile])],
})
export class PatientsModule {}
