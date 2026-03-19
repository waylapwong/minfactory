import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { UserDto } from '../models/dtos/user.dto';
import { UserService } from '../services/user.service';
import { UserController } from './user.controller';

describe('UserController', () => {
  let userController: UserController;

  const mockUserService = {
    createUser: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [{ provide: UserService, useValue: mockUserService }],
    }).compile();

    userController = module.get<UserController>(UserController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const authorizationHeader = 'Bearer valid-token';

    it('should return user dto on success', async () => {
      const dto: UserDto = new UserDto();
      dto.id = '550e8400-e29b-41d4-a716-446655440000';
      dto.email = 'user@example.com';
      dto.createdAt = new Date();

      mockUserService.createUser.mockResolvedValue(dto);

      const result = await userController.create(authorizationHeader);

      expect(result).toBe(dto);
      expect(mockUserService.createUser).toHaveBeenCalledWith(authorizationHeader);
    });

    it('should propagate UnauthorizedException from service', async () => {
      mockUserService.createUser.mockRejectedValue(new UnauthorizedException());

      await expect(userController.create(authorizationHeader)).rejects.toThrow(UnauthorizedException);
    });

    it('should propagate ConflictException from service', async () => {
      mockUserService.createUser.mockRejectedValue(new ConflictException());

      await expect(userController.create(authorizationHeader)).rejects.toThrow(ConflictException);
    });
  });
});
