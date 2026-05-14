import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Patient } from './entities/patient.entity.js';
import { HealthProfile } from './entities/health-profile.entity.js';
import { User } from '../users/entities/user.entity.js';
import { PatientsService } from './patients.service.js';
import { PatientsController } from './patients.controller.js';

@Module({
  imports: [TypeOrmModule.forFeature([Patient, HealthProfile, User])],
  providers: [PatientsService],
  controllers: [PatientsController],
  exports: [PatientsService],
})
export class PatientsModule {}
