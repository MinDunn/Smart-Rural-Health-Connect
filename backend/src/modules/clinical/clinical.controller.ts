import { Controller, Get, Post, Body, Param, Patch } from '@nestjs/common';
import { ClinicalService } from './clinical.service.js';

@Controller('clinical')
export class ClinicalController {
  constructor(private readonly clinicalService: ClinicalService) {}

  @Get('history/:patientId')
  async getHistory(@Param('patientId') patientId: string) {
    return this.clinicalService.getPatientHistory(patientId);
  }

  @Get('appointments/upcoming/:patientId')
  async getUpcoming(@Param('patientId') patientId: string) {
    return this.clinicalService.getUpcomingAppointments(patientId);
  }

  @Post('appointments')
  async createAppointment(@Body() data: any) {
    return this.clinicalService.createAppointment(data);
  }

  @Post('appointments/:id/consultation')
  async createConsultation(@Param('id') id: string, @Body() data: any) {
    return this.clinicalService.createConsultation(id, data);
  }

  @Post('consultations/:id/prescription')
  async createPrescription(@Param('id') id: string, @Body() data: any) {
    return this.clinicalService.createPrescription(id, data);
  }

  @Get('latest-prescription/:patientId')
  async getLatestPrescription(@Param('patientId') patientId: string) {
    return this.clinicalService.getLatestPrescription(patientId);
  }

  @Get('requests/pending')
  async getPendingRequests() {
    return this.clinicalService.getPendingRequests();
  }

  @Get('requests/accepted')
  async getAcceptedRequests() {
    return this.clinicalService.getAcceptedRequests();
  }

  @Patch('appointments/:id/accept')
  async acceptAppointment(@Param('id') id: string) {
    return this.clinicalService.acceptAppointment(id);
  }

  @Get('dashboard/stats')
  async getDashboardStats() {
    return this.clinicalService.getDashboardStats();
  }

  @Get('dashboard/activity')
  async getRecentActivity() {
    return this.clinicalService.getRecentActivity();
  }

  @Post('appointments/:id/complete')
  async completeConsultation(@Param('id') id: string, @Body() data: any) {
    return this.clinicalService.completeConsultation(id, data);
  }

  @Get('appointments/:id/result')
  async getConsultationResult(@Param('id') id: string) {
    return this.clinicalService.getConsultationResult(id);
  }

  @Get('patients/:id/latest-consultation')
  async getLatestConsultation(@Param('id') id: string) {
    return this.clinicalService.getLatestConsultation(id);
  }
}
