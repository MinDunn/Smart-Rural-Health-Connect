import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity.js';
import { Role } from './entities/role.entity.js';
import { Profile } from './entities/profile.entity.js';
import { SeedService } from './seed.service.js';
import { UsersService } from './users.service.js';
import { UsersController } from './user.controller.js';

@Module({
  imports: [TypeOrmModule.forFeature([User, Role, Profile])],
  providers: [SeedService, UsersService],
  controllers: [UsersController],
  exports: [TypeOrmModule, UsersService],
})
export class UsersModule {}
