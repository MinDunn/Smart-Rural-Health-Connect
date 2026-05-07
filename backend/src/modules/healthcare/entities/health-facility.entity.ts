import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Doctor } from './doctor.entity';

@Entity('health_facilities')
export class HealthFacility {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  type: string; // e.g., Commune Health Center, District Hospital

  @Column()
  address: string;

  @Column({ nullable: true })
  phone: string;

  @OneToMany(() => Doctor, (doctor) => doctor.facility)
  doctors: Doctor[];
}
