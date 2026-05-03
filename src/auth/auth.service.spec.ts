import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ManagersService } from '../managers/managers.service';
import { Manager } from '../managers/entities/manager.entity';

jest.mock('bcrypt', () => ({
  compare: jest.fn(),
  hash: jest.fn(),
}));

import * as bcrypt from 'bcrypt';

const mockManager: Manager = {
  id: 'uuid-1',
  name: 'João Silva',
  email: 'joao@empresa.com',
  password: '$2b$10$hashedpassword',
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('AuthService', () => {
  let service: AuthService;
  let managersService: jest.Mocked<ManagersService>;
  let jwtService: jest.Mocked<JwtService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: ManagersService,
          useValue: {
            findByEmail: jest.fn(),
            create: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: { sign: jest.fn().mockReturnValue('signed-token') },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    managersService = module.get(ManagersService);
    jwtService = module.get(JwtService);
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should return an access token on valid credentials', async () => {
      managersService.findByEmail.mockResolvedValue(mockManager);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      jwtService.sign.mockReturnValue('signed-token');

      const result = await service.login({ email: mockManager.email, password: 'plain' });

      expect(result).toEqual({ access_token: 'signed-token' });
      expect(jwtService.sign).toHaveBeenCalledWith({ sub: mockManager.id, email: mockManager.email });
    });

    it('should throw UnauthorizedException when manager is not found', async () => {
      managersService.findByEmail.mockResolvedValue(null);

      await expect(service.login({ email: 'x@x.com', password: 'pass' }))
        .rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when password does not match', async () => {
      managersService.findByEmail.mockResolvedValue(mockManager);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.login({ email: mockManager.email, password: 'wrong' }))
        .rejects.toThrow(UnauthorizedException);
    });
  });

  describe('register', () => {
    it('should create a manager and return it without the password field', async () => {
      managersService.findByEmail.mockResolvedValue(null);
      managersService.create.mockResolvedValue(mockManager);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed');

      const result = await service.register({ name: 'João Silva', email: 'joao@empresa.com', password: 'pass12345' });

      expect(result).not.toHaveProperty('password');
      expect(result.email).toBe(mockManager.email);
      expect(bcrypt.hash).toHaveBeenCalledWith('pass12345', 10);
    });

    it('should throw ConflictException when email is already registered', async () => {
      managersService.findByEmail.mockResolvedValue(mockManager);

      await expect(service.register({ name: 'X', email: mockManager.email, password: 'pass12345' }))
        .rejects.toThrow(ConflictException);
    });
  });
});
