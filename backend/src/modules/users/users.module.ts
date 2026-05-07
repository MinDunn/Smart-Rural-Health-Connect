import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Role } from './entities/role.entity';
import { Profile } from './entities/profile.entity';
import { SeedService } from './seed.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, Role, Profile])],
  providers: [SeedService],
  exports: [TypeOrmModule],
})
export class UsersModule {}
