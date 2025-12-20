import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from '../user.service';
import { UserRepository } from '../user.repository';
import { EntityManager } from '@mikro-orm/mysql';

describe('UsersService', () => {
  let service: UserService;

  const mockEntityManager = {
    persistAndFlush: jest.fn().mockImplementation(async () => void 0),
  };
  const mockUserRepository = {
    findAll: jest.fn().mockImplementation(async () => []),
    findOne: jest.fn().mockImplementation(async options => ({
      id: options.id ?? Date.now(),
      email: options.email ?? 'test@test.com',
      password: options.password ?? 'test',
      bio: 'test',
      image: 'test.jpg',
      username: 'test',
    })),
    count: jest.fn().mockImplementation(() => 0),
    nativeDelete: jest.fn().mockImplementation(() => 1),
    findOneOrFail: jest.fn().mockImplementation(options => ({
      id: Date.now(),
      email: options.email ?? 'test@test.com',
      password: options.password ?? 'test',
      bio: 'test',
      username: 'test',
      image: 'test.jpg',
    })),
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
    const user = await service.findOne({
      email: 'test@test.com',
      password: 'test',
    });
    expect(user).toEqual({
      id: expect.any(Number),
      email: 'test@test.com',
      password: 'ad71148c79f21ab9eec51ea5c7dd2b668792f7c0d3534ae66b22f71c61523fb3',
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
        email: 'test@test.com',
        image: 'test.jpg',
        token: expect.any(String),
        username: 'test',
      },
    });
  });
});
