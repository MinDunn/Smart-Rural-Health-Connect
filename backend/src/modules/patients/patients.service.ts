import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Patient } from './entities/patient.entity';
import { HealthProfile } from './entities/health-profile.entity';
import { User } from '../users/entities/user.entity';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { CreateHealthProfileDto } from './dto/create-health-profile.dto';

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
    let patient = await this.patientsRepository.findOne({
      where: { user: { id: userId } },
      relations: ['user', 'user.profile', 'healthProfiles'],
    });

    if (!patient) {
      // Lazy creation: Create patient if user exists
      const user = await this.userRepository.findOne({
        where: { id: userId },
        relations: ['profile'],
      });
      if (!user) {
        throw new NotFoundException('User not found');
      }

      console.log(
        `[PATIENTS] Creating lazy patient record for user: ${userId}`,
      );
      patient = this.patientsRepository.create({
        user: user,
        bloodType: 'Không rõ',
      });
      await this.patientsRepository.save(patient);
    }

    return patient;
  }

  async updatePatientInfo(
    userId: string,
    data: UpdatePatientDto,
  ): Promise<Patient> {
    const patient = await this.findByUserId(userId);

    // 1. Cập nhật thông tin Profile (Họ tên, SĐT) nếu có
    if (patient.user && patient.user.profile) {
      if (data.firstName !== undefined)
        patient.user.profile.firstName = data.firstName;
      if (data.lastName !== undefined)
        patient.user.profile.lastName = data.lastName;
      if (data.phone !== undefined) patient.user.profile.phone = data.phone;
      if (data.address !== undefined)
        patient.user.profile.address = data.address;
      await this.userRepository.save(patient.user);
    }

    // 2. Cập nhật thông tin y tế
    if (data.bloodType !== undefined) patient.bloodType = data.bloodType;
    if (data.allergies !== undefined) patient.allergies = data.allergies;
    if (data.medicalHistory !== undefined)
      patient.medicalHistory = data.medicalHistory;
    if (data.emergencyContacts !== undefined)
      patient.emergencyContacts = data.emergencyContacts;

    return this.patientsRepository.save(patient);
  }

  async createHealthProfile(
    userId: string,
    data: CreateHealthProfileDto,
  ): Promise<HealthProfile> {
    const patient = await this.findByUserId(userId);
    const profile = this.healthProfileRepository.create({
      ...data,
      patient,
    });
    return this.healthProfileRepository.save(profile);
  }
}
