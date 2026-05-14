import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { Role } from './entities/role.entity';
import { Profile } from './entities/profile.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(Profile)
    private readonly profileRepository: Repository<Profile>,
  ) {}

  async findByIdentifier(identifier: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: [{ email: identifier }, { profile: { phone: identifier } }],
      relations: ['role', 'profile', 'patient'],
      select: ['id', 'email', 'password', 'isActive'],
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { email },
      relations: ['role', 'profile', 'patient'],
      select: ['id', 'email', 'password', 'isActive'],
    });
  }

  async findById(id: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { id },
      relations: ['role', 'profile'],
    });
  }

  async create(userData: any): Promise<User> {
    const existingUser = await this.findByEmail(userData.email);
    if (existingUser) {
      throw new ConflictException('Email đã tồn tại');
    }

    // Tìm role mặc định (ví dụ: citizen) nếu không truyền vào
    let role: Role | null = null;
    if (userData.roleName) {
      role = await this.roleRepository.findOne({
        where: { name: userData.roleName },
      });
    }

    if (!role) {
      role = await this.roleRepository.findOne({ where: { name: 'citizen' } });
    }

    if (!role) {
      throw new Error(
        'Default role "citizen" not found. Please seed the database.',
      );
    }

    const user = new User();
    user.email = userData.email;
    user.password = userData.password;
    user.role = role;

    const profile = new Profile();
    profile.firstName = userData.firstName || '';
    profile.lastName = userData.lastName || '';
    profile.phone = userData.phone || '';

    user.profile = profile;

    return this.userRepository.save(user);
  }

  async updatePasswordByEmail(
    email: string,
    newPassword: string,
  ): Promise<void> {
    const user = await this.findByEmail(email);
    if (!user) throw new Error('User not found');
    user.password = newPassword;
    await this.userRepository.save(user);
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
