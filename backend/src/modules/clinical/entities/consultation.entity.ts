import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Appointment } from './appointment.entity';
import { Prescription } from './prescription.entity';
import { OneToMany } from 'typeorm';

@Entity('consultations')
export class Consultation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => Appointment)
  @JoinColumn({ name: 'appointment_id' })
  appointment: Appointment;

  @Column({ type: 'text', nullable: true })
  diagnosis: string;

  @Column({ type: 'text', nullable: true })
  treatmentPlan: string;

  @Column({ type: 'text', nullable: true })
  doctorNotes: string;

  @Column({ type: 'text', nullable: true })
  careInstructions: string;

  @Column({ type: 'text', nullable: true })
  followUpUrgency: string;

  @Column({ type: 'text', nullable: true })
  prescriptionSummary: string;

  @OneToMany(() => Prescription, (p) => p.consultation)
  prescriptions: Prescription[];

  @CreateDateColumn()
  createdAt: Date;
}
