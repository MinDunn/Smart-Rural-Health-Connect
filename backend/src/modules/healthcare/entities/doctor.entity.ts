import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { HealthFacility } from './health-facility.entity';
import { Specialty } from './specialty.entity';

@Entity('doctors')
export class Doctor {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => HealthFacility, (hf) => hf.doctors)
  @JoinColumn({ name: 'facility_id' })
  facility: HealthFacility;

  @ManyToOne(() => Specialty, (s) => s.doctors)
  @JoinColumn({ name: 'specialty_id' })
  specialty: Specialty;

  @Column({ type: 'int', nullable: true })
  experienceYears: number;

  @Column({ nullable: true })
  certificateNumber: string;

  @Column({ type: 'text', nullable: true })
  biography: string;
}
