import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ClinicalService } from './clinical.service';

@Controller('clinical')
export class ClinicalController {
  constructor(private readonly clinicalService: ClinicalService) {}

  @Get('history/:patientId')
  async getHistory(@Param('patientId') patientId: string) {
    return this.clinicalService.getPatientHistory(patientId);
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
}
