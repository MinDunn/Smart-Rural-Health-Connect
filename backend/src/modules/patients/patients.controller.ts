import { Controller, Get, Post, Body, Param, Put } from '@nestjs/common';
import { PatientsService } from './patients.service';

@Controller('patients')
export class PatientsController {
  constructor(private readonly patientsService: PatientsService) {}

  @Get(':userId')
  async getPatient(@Param('userId') userId: string) {
    return this.patientsService.findByUserId(userId);
  }

  @Put(':userId')
  async updatePatient(@Param('userId') userId: string, @Body() data: any) {
    return this.patientsService.updatePatientInfo(userId, data);
  }

  @Post(':userId/health-profiles')
  async addHealthProfile(@Param('userId') userId: string, @Body() data: any) {
    return this.patientsService.createHealthProfile(userId, data);
  }
}
