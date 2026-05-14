import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AiKnowledge } from './entities/ai-knowledge.entity';
import { AiChat } from './entities/ai-chat.entity';
import { AiService } from './ai.service';
import { AiController } from './ai.controller';
import { Patient } from '../patients/entities/patient.entity';
import { HealthProfile } from '../patients/entities/health-profile.entity';
import { HealthMetric } from '../iot/entities/health-metric.entity';
import { Consultation } from '../clinical/entities/consultation.entity';
import { Prescription } from '../clinical/entities/prescription.entity';
import { Appointment } from '../clinical/entities/appointment.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AiKnowledge, 
      AiChat,
      Patient,
      HealthProfile,
      HealthMetric,
      Consultation,
      Prescription,
      Appointment
    ])
  ],
  providers: [AiService],
  controllers: [AiController],
  exports: [AiService],
})
export class AiModule {}
