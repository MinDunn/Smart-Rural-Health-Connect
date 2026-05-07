import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Device } from './device.entity';
import { Patient } from '../../patients/entities/patient.entity';

@Entity('health_metrics')
export class HealthMetric {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Device, (device) => device.metrics)
  @JoinColumn({ name: 'device_id' })
  device: Device;

  @ManyToOne(() => Patient)
  @JoinColumn({ name: 'patient_id' })
  patient: Patient;

  @Column()
  @Index()
  type: string; // heart_rate, spo2, temperature, blood_pressure

  @Column({ type: 'float' })
  value: number;

  @Column({ nullable: true })
  unit: string;

  @CreateDateColumn()
  @Index()
  timestamp: Date;
}
