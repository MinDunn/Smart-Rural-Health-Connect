import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Consultation } from './consultation.entity';

@Entity('prescriptions')
export class Prescription {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Consultation)
  @JoinColumn({ name: 'consultation_id' })
  consultation: Consultation;

  @Column({ type: 'text' })
  medicines: string; // List of medicines and instructions

  @Column({ nullable: true })
  duration: string;

  @CreateDateColumn()
  createdAt: Date;
}
