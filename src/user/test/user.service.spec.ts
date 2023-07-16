import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from '../user.service';
import { UserRepository } from '../user.repository';
import { EntityManager } from '@mikro-orm/core';

describe('UsersService', () => {
  let service: UserService;

  const mockEntityManager = {
    persistAndFlush: jest.fn().mockImplementation(() => {
      return Promise.resolve();
    }),
  };
  const mockUserRepository = {
    findAll: jest.fn().mockImplementation(() => {
      return Promise.resolve([]);
    }),
    findOne: jest.fn().mockImplementation((options) => {
      return Promise.resolve({
        id: Date.now() || options.id,
        email: 'test@test.com' || options.email,
        password: 'test' || options.password,
        bio: 'test',
        image: 'test.jpg',
        username: 'test',
      });
    }),
    count: jest.fn().mockImplementation(() => 0),
    nativeDelete: jest.fn().mockImplementation(() => {
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
        {
          provide: EntityManager,
          useValue: mockEntityManager,
        }
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
  it('should create user', async () => {
    expect(
      await service.create({
        email: 'test@test.com',
        password: 'test',
        username: 'test1',
      }),
    ).toEqual({
      user: {
        bio: '',
        email: 'test@test.com',
        image: '',
        token: expect.any(String),
        username: 'test1',
      },
    });
  });
  it('should return user by id', async () => {
    expect(await service.findById(1)).toEqual({
      user: {
        email: 'test@test.com',
        bio: 'test',
        image: 'test.jpg',
        token: expect.any(String),
        username: 'test',
      },
    });
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
