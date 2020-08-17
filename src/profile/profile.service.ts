import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { User } from '../user/user.entity';
import { IProfileData, IProfileRO } from './profile.interface';
import { EntityRepository, FilterQuery } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs'

@Injectable()
export class ProfileService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: EntityRepository<User>,
  ) {}

  async findAll(): Promise<User[]> {
    return this.userRepository.findAll();
  }

  async findOne(options?: FilterQuery<User>): Promise<IProfileRO> {
    const user = await this.userRepository.findOne(options);
    delete user.id;

    if (user) {
      delete user.password;
    }

    return { profile: user };
  }

  async findProfile(id: number, followingUsername: string): Promise<IProfileRO> {
    const foundProfile = await this.userRepository.findOne({ username: followingUsername }, ['followers']);
    const follower = this.userRepository.getReference(id);

    if (!foundProfile) {
      return;
    }

    const profile: IProfileData = {
      bio: foundProfile.bio,
      image: foundProfile.image,
      username: foundProfile.username,
      following: foundProfile.followers.contains(follower),
    };

    return { profile };
  }

  async follow(followerEmail: string, username: string): Promise<IProfileRO> {
    if (!followerEmail || !username) {
      throw new HttpException('Follower email and username not provided.', HttpStatus.BAD_REQUEST);
    }

    const followingUser = await this.userRepository.findOne({ username }, ['followers']);
    const followerUser = await this.userRepository.findOne({ email: followerEmail });

    if (followingUser.email === followerEmail) {
      throw new HttpException('FollowerEmail and FollowingId cannot be equal.', HttpStatus.BAD_REQUEST);
    }

    followingUser.followers.add(followerUser);
    await this.userRepository.flush();

    const profile: IProfileData = {
      bio: followingUser.bio,
      following: true,
      image: followingUser.image,
      username: followingUser.username,
    };

    return { profile };
  }

  async unFollow(followerId: number, username: string): Promise<IProfileRO> {
    if (!followerId || !username) {
      throw new HttpException('FollowerId and username not provided.', HttpStatus.BAD_REQUEST);
    }

    const followingUser = await this.userRepository.findOne({ username }, ['followers']);
    const followerUser = this.userRepository.getReference(followerId);

    if (followingUser.id === followerId) {
      throw new HttpException('FollowerId and FollowingId cannot be equal.', HttpStatus.BAD_REQUEST);
    }

    followingUser.followers.remove(followerUser);
    await this.userRepository.flush();

    const profile: IProfileData = {
      bio: followingUser.bio,
      following: false,
      image: followingUser.image,
      username: followingUser.username,
    };

    return { profile };
  }
}
