import { Test, TestingModule } from '@nestjs/testing';
import crypto from 'crypto';
import { UserService } from '../user.service';
import { UserRepository } from '../user.repository';
import { LoginUserDto } from '../dto';

describe('UsersService', () => {
  let service: UserService;

  const mockUserRepository = {
    findAll: jest.fn().mockImplementation(() => {
      return Promise.resolve([]);
    }),
    findOne: jest.fn().mockImplementation((loginUserDto: LoginUserDto) => {
      return Promise.resolve({
        id: Date.now(),
        email: loginUserDto.email,
        bio: 'test',
        image: 'test.jpg',
        username: 'test',
        password: crypto
          .createHmac('sha256', loginUserDto.password)
          .digest('hex'),
      });
    }),
    remove: jest.fn().mockImplementation((email: string) => {
      return 1;
    }),
    findOneOrFail: jest.fn().mockImplementation((email: string) => {
      return {
        id: Date.now(),
        email,
        bio: 'test',
        username: 'test',
        image: 'test.jpg',
        exp: {
          getTime() {
            return 100;
          },
        },
      };
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: UserRepository,
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
  it('should return all users', async () => {
    expect(await service.findAll()).toStrictEqual([]);
  });
  it('should return one user', async () => {
    expect(
      await service.findOne({
        email: 'test@test.com',
        password: 'test',
      }),
    ).toEqual({
      id: expect.any(Number),
      email: 'test@test.com',
      password: expect.any(String),
      username: 'test',
      bio: 'test',
      image: 'test.jpg',
    });
  });
  it('should delete user', async () => {
    expect(await service.delete('test@test.com')).toBe(1);
  });
  it('should return user by email', async () => {
    expect(await service.findByEmail('test@test.com')).toEqual({
      user: {
        bio: 'test',
        email: { email: 'test@test.com' },
        image: 'test.jpg',
        token: expect.any(String),
        username: 'test',
      },
    });
  });
});
