import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Appointment } from './entities/appointment.entity';
import { Consultation } from './entities/consultation.entity';
import { Prescription } from './entities/prescription.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Appointment, Consultation, Prescription])],
  exports: [TypeOrmModule],
})
export class ClinicalModule {}
