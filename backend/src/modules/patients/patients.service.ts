import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Patient } from './entities/patient.entity';
import { HealthProfile } from './entities/health-profile.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class PatientsService {
  constructor(
    @InjectRepository(Patient)
    private patientsRepository: Repository<Patient>,
    @InjectRepository(HealthProfile)
    private healthProfileRepository: Repository<HealthProfile>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async findByUserId(userId: string): Promise<Patient> {
    const patient = await this.patientsRepository.findOne({
      where: { user: { id: userId } },
      relations: ['user', 'user.profile', 'healthProfiles'],
    });
    if (!patient) {
      throw new NotFoundException('Patient not found');
    }
    return patient;
  }

  async updatePatientInfo(userId: string, data: Partial<Patient>): Promise<Patient> {
    const patient = await this.findByUserId(userId);
    Object.assign(patient, data);
    return this.patientsRepository.save(patient);
  }

  async createHealthProfile(userId: string, data: Partial<HealthProfile>): Promise<HealthProfile> {
    const patient = await this.findByUserId(userId);
    const profile = this.healthProfileRepository.create({
      ...data,
      patient,
    });
    return this.healthProfileRepository.save(profile);
  }
}
