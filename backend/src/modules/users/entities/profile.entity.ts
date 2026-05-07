import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
} from 'typeorm';
import { User } from './user.entity';

@Entity('profiles')
export class Profile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true, unique: true })
  idCard: string; // CCCD

  @Column({ nullable: true })
  gender: string;

  @Column({ type: 'date', nullable: true })
  dob: Date;

  @OneToOne(() => User, (user) => user.profile)
  user: User;
}
