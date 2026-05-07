import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Patient } from '../../patients/entities/patient.entity';
import { HealthMetric } from './health-metric.entity';

@Entity('devices')
export class Device {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  type: string; // e.g., Smart Watch, Blood Pressure Monitor

  @Column({ unique: true })
  macAddress: string;

  @Column({ default: 'active' })
  status: string;

  @ManyToOne(() => Patient)
  @JoinColumn({ name: 'patient_id' })
  patient: Patient;

  @OneToMany(() => HealthMetric, (metric) => metric.device)
  metrics: HealthMetric[];
}
