import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { validate } from 'class-validator';
import * as crypto from 'crypto';
import * as jwt from 'jsonwebtoken';
import { DeleteResult, getRepository, Repository } from 'typeorm';
import { SECRET } from '../config';
import { CreateUserDto, LoginUserDto, UpdateUserDto } from './dto';
import { UserEntity } from './user.entity';
import { IUserRO } from './user.interface';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  public async findAll(): Promise<UserEntity[]> {
    return this.userRepository.find();
  }

  public async findOne(loginUserDto: LoginUserDto): Promise<UserEntity> {
    const findOneOptions = {
      email: loginUserDto.email,
      password: crypto.createHmac('sha256', loginUserDto.password).digest('hex'),
    };

    return this.userRepository.findOne(findOneOptions);
  }

  public async create(dto: CreateUserDto): Promise<IUserRO> {

    // check uniqueness of username/email
    const { username, email, password } = dto;
    const qb = this.userRepository
      .createQueryBuilder('user')
      .where('user.username = :username', { username })
      .orWhere('user.email = :email', { email });

    const user = await qb.getOne();

    if (user) {
      const errorinfo = { username: 'Username and email must be unique.' };
      throw new HttpException({ message: 'Input data validation failed', errors: errorinfo }, HttpStatus.BAD_REQUEST);
    }

    // create new user
    const newUser = new UserEntity();
    newUser.username = username;
    newUser.email = email;
    newUser.password = password;
    newUser.articles = [];

    const errors = await validate(newUser);
    if (errors.length > 0) {
      const errorinfo = { username: 'Userinput is not valid.' };
      throw new HttpException({ message: 'Input data validation failed', errors: errorinfo }, HttpStatus.BAD_REQUEST);
    } else {
      const savedUser = await this.userRepository.save(newUser);
      return this.buildUserRO(savedUser);
    }
  }

  public async update(id: number, dto: UpdateUserDto) {
    const toUpdate = await this.userRepository.findOne(id);
    delete toUpdate.password;
    delete toUpdate.favorites;
    const updated = { ...toUpdate, dto };
    const savedUser = await this.userRepository.save(updated);

    return this.buildUserRO(savedUser);
  }

  public async delete(email: string): Promise<DeleteResult> {
    return this.userRepository.delete({ email });
  }

  public async findById(id: number): Promise<IUserRO> {
    const user = await this.userRepository.findOne(id);

    if (!user) {
      const errors = { User: ' not found' };
      throw new HttpException({ errors }, 401);
    }

    return this.buildUserRO(user);
  }

  public async findByEmail(email: string): Promise<IUserRO> {
    const user = await this.userRepository.findOne({ email });
    return this.buildUserRO(user);
  }

  public generateJWT(user) {
    const today = new Date();
    const exp = new Date(today);
    exp.setDate(today.getDate() + 60);

    return jwt.sign({
      email: user.email,
      exp: exp.getTime() / 1000,
      id: user.id,
      username: user.username,
    }, SECRET);
  }

  private buildUserRO(user: UserEntity) {
    const userRO = {
      bio: user.bio,
      email: user.email,
      image: user.image,
      token: this.generateJWT(user),
      username: user.username,
    };

    return { user: userRO };
  }
}
