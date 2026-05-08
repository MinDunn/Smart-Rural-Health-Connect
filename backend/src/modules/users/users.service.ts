import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { email },
      relations: ['role', 'profile'],
      select: ['id', 'email', 'password', 'isActive'], // explicitly select password for validation
    });
  }

  async findById(id: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { id },
      relations: ['role', 'profile'],
    });
  }

  async updateProfile(id: string, profileData: any): Promise<User> {
    const user = await this.findById(id);
    if (!user) throw new Error('User not found');
    if (!user.profile) {
      user.profile = profileData;
    } else {
      Object.assign(user.profile, profileData);
    }
    return this.userRepository.save(user);
  }
}
