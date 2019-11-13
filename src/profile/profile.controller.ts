import { Controller, Delete, Get, HttpCode, Param, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiUseTags } from '@nestjs/swagger';
import { User } from '../user/user.decorator';
import { IProfileRO } from './profile.interface';
import { ProfileService } from './profile.service';

@ApiBearerAuth()
@ApiUseTags('profiles')
@Controller('profiles')
export class ProfileController {

  constructor(private readonly profileService: ProfileService) {}

  @Get(':username')
  public async getProfile(@User('id') userId: number, @Param('username') username: string): Promise<IProfileRO> {
    return this.profileService.findProfile(userId, username);
  }

  @Post(':username/follow')
  @HttpCode(200)
  public async follow(@User('email') email: string, @Param('username') username: string): Promise<IProfileRO> {
    return this.profileService.follow(email, username);
  }

  @Delete(':username/follow')
  public async unFollow(@User('id') userId: number, @Param('username') username: string): Promise<IProfileRO> {
    return this.profileService.unFollow(userId, username);
  }
}
