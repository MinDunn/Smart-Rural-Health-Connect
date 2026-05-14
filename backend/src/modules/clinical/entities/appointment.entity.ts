import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Patient } from '../../patients/entities/patient.entity';
import { Doctor } from '../../healthcare/entities/doctor.entity';

@Entity('appointments')
export class Appointment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Patient)
  @JoinColumn({ name: 'patient_id' })
  patient: Patient;

  @ManyToOne(() => Doctor)
  @JoinColumn({ name: 'doctor_id' })
  doctor: Doctor;

  @Column({ type: 'timestamp', nullable: true })
  appointmentDate: Date;

  @Column({ default: 'pending' })
  status: string; // pending, confirmed, cancelled, completed

  @Column({ type: 'text', nullable: true })
  reason: string;

  @Column({ type: 'simple-array', nullable: true })
  attachments: string[];

  @Column({ default: 'normal' })
  urgency: string; // normal, high

  @Column({ default: false })
  consentGiven: boolean;

  @Column({ default: false })
  isThreeWayConsultation: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}
