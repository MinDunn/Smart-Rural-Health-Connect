import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Appointment } from './entities/appointment.entity.js';
import { Consultation } from './entities/consultation.entity.js';
import { Prescription } from './entities/prescription.entity.js';

@Injectable()
export class ClinicalService {
  private readonly logger = new Logger(ClinicalService.name);

  constructor(
    @InjectRepository(Appointment)
    private appointmentRepository: Repository<Appointment>,
    @InjectRepository(Consultation)
    private consultationRepository: Repository<Consultation>,
    @InjectRepository(Prescription)
    private prescriptionRepository: Repository<Prescription>,
  ) {}

  async getPatientHistory(patientId: string): Promise<Appointment[]> {
    return this.appointmentRepository.find({
      where: { patient: { id: patientId } },
      relations: ['doctor', 'doctor.user', 'doctor.user.profile'],
      order: { appointmentDate: 'DESC' },
    });
  }

  async getUpcomingAppointments(patientId: string): Promise<Appointment[]> {
    return this.appointmentRepository.find({
      where: { 
        patient: { id: patientId },
        status: 'scheduled'
      },
      relations: ['doctor', 'doctor.user', 'doctor.user.profile'],
      order: { appointmentDate: 'ASC' },
      take: 5,
    });
  }

  async createAppointment(data: any): Promise<Appointment> {
    const appointment = this.appointmentRepository.create(data as Appointment);
    const saved = await this.appointmentRepository.save(appointment);

    // Simulate Broadcast Notification to all LHWs in the station
    this.logger.log(`[BROADCAST] New support request from Patient ${data.patient?.id || 'unknown'}`);
    this.logger.log(`[NOTIFY] Station LHWs alerted for urgency: ${data.urgency || 'normal'}`);

    return saved;
  }

  async createConsultation(
    appointmentId: string,
    data: any,
  ): Promise<Consultation> {
    const consultation = this.consultationRepository.create({
      ...data,
      appointment: { id: appointmentId },
    } as Consultation);
    return this.consultationRepository.save(consultation);
  }

  async createPrescription(
    consultationId: string,
    data: any,
  ): Promise<Prescription> {
    const prescription = this.prescriptionRepository.create({
      ...data,
      consultation: { id: consultationId },
    } as Prescription);
    return this.prescriptionRepository.save(prescription);
  }

  async getLatestPrescription(patientId: string): Promise<Prescription | null> {
    return this.prescriptionRepository.findOne({
      where: { consultation: { appointment: { patient: { id: patientId } } } },
      relations: [
        'consultation',
        'consultation.appointment',
        'consultation.appointment.doctor',
      ],
      order: { createdAt: 'DESC' },
    });
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
      order: { createdAt: 'DESC' },
    });
  }

  async acceptAppointment(id: string): Promise<Appointment> {
    const appointment = await this.appointmentRepository.findOne({ where: { id } });
    if (!appointment) throw new NotFoundException('Appointment not found');
    appointment.status = 'confirmed';
    return this.appointmentRepository.save(appointment);
  }

  async getDashboardStats() {
    const [pending, confirmed, completed, total] = await Promise.all([
      this.appointmentRepository.count({ where: { status: 'pending' } }),
      this.appointmentRepository.count({ where: { status: 'confirmed' } }),
      this.appointmentRepository.count({ where: { status: 'completed' } }),
      this.appointmentRepository.count(),
    ]);
    return { pending, confirmed, completed, total };
  }

  async getRecentActivity(): Promise<Appointment[]> {
    return this.appointmentRepository.find({
      relations: ['patient', 'patient.user', 'patient.user.profile'],
      order: { createdAt: 'DESC' },
      take: 10,
    });
  }
}
