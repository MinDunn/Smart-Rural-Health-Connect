import { Controller, Get, Post, Body, Param, Put } from '@nestjs/common';
import { PatientsService } from './patients.service';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { CreateHealthProfileDto } from './dto/create-health-profile.dto';

@Controller('patients')
export class PatientsController {
  constructor(private readonly patientsService: PatientsService) {}

  @Get(':userId')
  async getPatient(@Param('userId') userId: string) {
    return this.patientsService.findByUserId(userId);
  }

  @Put(':userId')
  async updatePatient(
    @Param('userId') userId: string,
    @Body() data: UpdatePatientDto,
  ) {
    return this.patientsService.updatePatientInfo(userId, data);
  }

  @Post(':userId/health-profiles')
  async addHealthProfile(
    @Param('userId') userId: string,
    @Body() data: CreateHealthProfileDto,
  ) {
    return this.patientsService.createHealthProfile(userId, data);
  }
}
