import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Appointment } from './entities/appointment.entity';
import { Consultation } from './entities/consultation.entity';
import { Prescription } from './entities/prescription.entity';
import { ClinicalService } from './clinical.service';
import { ClinicalController } from './clinical.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Appointment, Consultation, Prescription]),
  ],
  providers: [ClinicalService],
  controllers: [ClinicalController],
  exports: [ClinicalService],
})
export class ClinicalModule {}
