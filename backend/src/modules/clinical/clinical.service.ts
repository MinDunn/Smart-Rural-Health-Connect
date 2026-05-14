import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual } from 'typeorm';
import { Appointment } from './entities/appointment.entity.js';
import { Consultation } from './entities/consultation.entity.js';
import { Prescription } from './entities/prescription.entity.js';

@Injectable()
export class ClinicalService {
  constructor(
    @InjectRepository(Appointment)
    private appointmentRepository: Repository<Appointment>,
    @InjectRepository(Consultation)
    private consultationRepository: Repository<Consultation>,
    @InjectRepository(Prescription)
    private prescriptionRepository: Repository<Prescription>,
  ) {}

  async findAllAppointments(): Promise<Appointment[]> {
    return this.appointmentRepository.find({
      relations: ['patient', 'patient.user', 'patient.user.profile'],
      order: { appointmentDate: 'DESC' },
    });
  }

  async findAppointmentById(id: string): Promise<Appointment> {
    const appointment = await this.appointmentRepository.findOne({
      where: { id },
      relations: ['patient', 'patient.user', 'patient.user.profile', 'consultation'],
    });
    if (!appointment) throw new NotFoundException('Appointment not found');
    return appointment;
  }

  async createAppointment(data: any): Promise<Appointment> {
    const appointment = this.appointmentRepository.create(data);
    return this.appointmentRepository.save(appointment);
  }

  async getPatientHistory(patientId: string): Promise<Appointment[]> {
    return this.appointmentRepository.find({
      where: { patient: { id: patientId } },
      relations: ['consultation', 'consultation.prescriptions'],
      order: { appointmentDate: 'DESC' },
    });
  }

  async getUpcomingAppointments(patientId: string): Promise<Appointment[]> {
    return this.appointmentRepository.find({
      where: { 
        patient: { id: patientId }, 
        status: 'confirmed',
        appointmentDate: MoreThanOrEqual(new Date())
      },
      order: { appointmentDate: 'ASC' },
    });
  }

  async createConsultation(appointmentId: string, data: any): Promise<Consultation> {
    const appointment = await this.findAppointmentById(appointmentId);
    const consultation = this.consultationRepository.create({
      ...data,
      appointment,
    });
    const saved = await this.consultationRepository.save(consultation);
    appointment.consultation = saved;
    await this.appointmentRepository.save(appointment);
    return saved;
  }

  async createPrescription(consultationId: string, data: any): Promise<Prescription> {
    const consultation = await this.consultationRepository.findOne({
      where: { id: consultationId },
    });
    if (!consultation) throw new NotFoundException('Consultation not found');

    const prescription = this.prescriptionRepository.create({
      ...data,
      consultation,
    });
    return this.prescriptionRepository.save(prescription);
  }

  async getLatestPrescription(patientId: string): Promise<Prescription | null> {
    const appointment = await this.appointmentRepository.findOne({
      where: { patient: { id: patientId } },
      relations: ['consultation', 'consultation.prescriptions'],
      order: { appointmentDate: 'DESC' },
    });

    if (appointment?.consultation?.prescriptions?.length) {
      return appointment.consultation.prescriptions[0];
    }
    return null;
  }

  async getPendingRequests(): Promise<Appointment[]> {
    return this.appointmentRepository.find({
      where: { status: 'pending' },
      relations: ['patient', 'patient.user', 'patient.user.profile'],
      order: { createdAt: 'DESC' },
    });
  }

  async getAcceptedRequests(): Promise<Appointment[]> {
    return this.appointmentRepository.find({
      where: { status: 'confirmed' },
      relations: ['patient', 'patient.user', 'patient.user.profile'],
      order: { appointmentDate: 'ASC' },
    });
  }

  async acceptAppointment(id: string): Promise<Appointment> {
    const appointment = await this.findAppointmentById(id);
    appointment.status = 'confirmed';
    return this.appointmentRepository.save(appointment);
  }

  async getDashboardStats(): Promise<any> {
    const total = await this.appointmentRepository.count();
    const pending = await this.appointmentRepository.count({ where: { status: 'pending' } });
    const completed = await this.appointmentRepository.count({ where: { status: 'completed' } });
    return { total, pending, completed };
  }

  async getRecentActivity(): Promise<any[]> {
    return this.appointmentRepository.find({
      relations: ['patient', 'patient.user', 'patient.user.profile'],
      order: { updatedAt: 'DESC' },
      take: 10,
    });
  }

  async completeConsultation(appointmentId: string, data: any): Promise<Appointment> {
    const appointment = await this.appointmentRepository.findOne({
      where: { id: appointmentId },
      relations: ['consultation']
    });

    if (!appointment) throw new NotFoundException('Appointment not found');

    let consultation = appointment.consultation;
    if (!consultation) {
      consultation = this.consultationRepository.create({
        appointment,
        ...data
      });
    } else {
      Object.assign(consultation, data);
    }

    await this.consultationRepository.save(consultation);

    appointment.status = 'completed';
    appointment.consultation = consultation;
    
    return this.appointmentRepository.save(appointment);
  }

  async getConsultationResult(appointmentId: string): Promise<Consultation> {
    const consultation = await this.consultationRepository.findOne({
      where: { appointment: { id: appointmentId } },
      relations: ['appointment']
    });
    if (!consultation) throw new NotFoundException('Consultation result not found');
    return consultation;
  }

  async getLatestConsultation(patientId: string): Promise<Consultation | null> {
    const latest = await this.appointmentRepository.findOne({
      where: { patient: { id: patientId }, status: 'completed' },
      relations: ['consultation'],
      order: { appointmentDate: 'DESC' },
    });
    return latest?.consultation || null;
  }
}
