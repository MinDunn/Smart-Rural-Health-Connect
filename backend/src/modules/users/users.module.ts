import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Role } from './entities/role.entity';
import { Profile } from './entities/profile.entity';
import { SeedService } from './seed.service';
import { UsersService } from './users.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, Role, Profile])],
  providers: [SeedService, UsersService],
  exports: [TypeOrmModule, UsersService],
})
export class UsersModule {}
