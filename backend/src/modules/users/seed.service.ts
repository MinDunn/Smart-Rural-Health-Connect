import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { Role } from './entities/role.entity';
import { Profile } from './entities/profile.entity';

@Injectable()
export class SeedService implements OnModuleInit {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async onModuleInit() {
    await this.seedRoles();
    await this.seedUsers();
  }

  private async seedRoles() {
    const roles = [
      { name: 'citizen', description: 'Người dân / Bệnh nhân' },
      { name: 'health_worker', description: 'Cán bộ y tế địa phương' },
      { name: 'doctor', description: 'Bác sĩ chuyên khoa' },
      { name: 'health_manager', description: 'Quản lý y tế' },
      { name: 'admin', description: 'Quản trị viên hệ thống' },
    ];

    for (const roleData of roles) {
      const existingRole = await this.roleRepository.findOne({
        where: { name: roleData.name },
      });
      if (!existingRole) {
        await this.roleRepository.save(this.roleRepository.create(roleData));
        this.logger.log(`Role seeded: ${roleData.name}`);
      }
    }
  }

  private async seedUsers() {
    const roles = await this.roleRepository.find();
    const password = await bcrypt.hash('123456', 10);

    for (const role of roles) {
      const email = `${role.name}@srhc.vn`;
      let user = await this.userRepository.findOne({
        where: { email },
      });

      if (!user) {
        const profile = new Profile();
        profile.firstName = 'Mẫu';
        profile.lastName = role.name.charAt(0).toUpperCase() + role.name.slice(1);

        user = this.userRepository.create({
          email,
          password,
          role,
          profile,
        });
        this.logger.log(`User created for role ${role.name}: ${email}`);
      } else {
        user.password = password;
        this.logger.log(`User password updated for role ${role.name}: ${email}`);
      }

      await this.userRepository.save(user);
    }
  }
}
