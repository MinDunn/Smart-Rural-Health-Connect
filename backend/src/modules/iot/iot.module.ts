import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Device } from './entities/device.entity';
import { HealthMetric } from './entities/health-metric.entity';
import { IotService } from './iot.service';
import { IotController } from './iot.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Device, HealthMetric])],
  providers: [IotService],
  controllers: [IotController],
  exports: [IotService],
})
export class IotModule {}
