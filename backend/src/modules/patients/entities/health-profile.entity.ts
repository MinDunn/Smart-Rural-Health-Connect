import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Patient } from './patient.entity';

@Entity('health_profiles')
export class HealthProfile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Patient, (patient) => patient.healthProfiles)
  @JoinColumn({ name: 'patient_id' })
  patient: Patient;

  @Column({ type: 'float', nullable: true })
  weight: number;

  @Column({ type: 'float', nullable: true })
  height: number;

  @Column({ type: 'float', nullable: true })
  bmi: number;

  @Column({ type: 'text', nullable: true })
  chronicDiseases: string;

  @Column({ default: 'self' })
  source: string; // self, worker

  @CreateDateColumn()
  createdAt: Date;
}
