import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HealthMetric } from './entities/health-metric.entity';
import { Device } from './entities/device.entity';

@Injectable()
export class IotService {
  constructor(
    @InjectRepository(HealthMetric)
    private metricRepository: Repository<HealthMetric>,
    @InjectRepository(Device)
    private deviceRepository: Repository<Device>,
  ) {}

  async saveMetric(data: any): Promise<HealthMetric> {
    const metric = this.metricRepository.create(data as HealthMetric);
    return this.metricRepository.save(metric);
  }

  async getLatestMetrics(patientId: string): Promise<HealthMetric[]> {
    return this.metricRepository.find({
      where: { patient: { id: patientId } },
      order: { timestamp: 'DESC' },
      take: 20,
    });
  }

  async getStabilityStatus(patientId: string): Promise<any> {
    const latest = await this.metricRepository.find({
      where: { patient: { id: patientId } },
      order: { timestamp: 'DESC' },
      take: 10,
    });
    
    // Simple logic to check if all recent metrics are stable
    const isStable = latest.every(m => m.isStable);
    return {
      isStable,
      lastChecked: latest[0]?.timestamp,
      count: latest.length,
    };
  }
}
