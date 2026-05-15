import { Controller, Get, Put, Param, Body } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('health-workers')
  async getHealthWorkers() {
    return this.usersService.getHealthWorkers();
  }

  @Get(':id')
  async getUser(@Param('id') id: string) {
    return this.usersService.findById(id);
  }

  @Put(':id/profile')
  async updateProfile(@Param('id') id: string, @Body() data: any) {
    try {
      return await this.usersService.updateProfile(id, data);
    } catch (error) {
      console.error('[UsersController] Error updating profile:', error);
      throw error;
    }
  }
}
