import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Doctor } from './doctor.entity';

@Entity('specialties')
export class Specialty {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @Column({ nullable: true })
  description: string;

  @OneToMany(() => Doctor, (doctor) => doctor.specialty)
  doctors: Doctor[];
}
