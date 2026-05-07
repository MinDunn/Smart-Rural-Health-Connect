import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Device } from './entities/device.entity';
import { HealthMetric } from './entities/health-metric.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Device, HealthMetric])],
  exports: [TypeOrmModule],
})
export class IotModule {}
