import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { IotService } from './iot.service';

@Controller('iot')
export class IotController {
  constructor(private readonly iotService: IotService) {}

  @Post('metrics')
  async saveMetric(@Body() data: any) {
    return this.iotService.saveMetric(data);
  }

  @Get('metrics/:patientId')
  async getMetrics(@Param('patientId') patientId: string) {
    return this.iotService.getLatestMetrics(patientId);
  }

  @Get('stability/:patientId')
  async getStability(@Param('patientId') patientId: string) {
    return this.iotService.getStabilityStatus(patientId);
  }
}
