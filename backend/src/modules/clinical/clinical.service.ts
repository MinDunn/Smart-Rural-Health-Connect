import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Appointment } from './entities/appointment.entity';
import { Consultation } from './entities/consultation.entity';
import { Prescription } from './entities/prescription.entity';

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
}
