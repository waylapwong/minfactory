import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { MinFactoryUserDomainMapper } from '../mapper/minfactory-user-domain.mapper';
import { MinFactoryUserEntityMapper } from '../mapper/minfactory-user-entity.mapper';
import { MinFactoryUser } from '../models/domains/minfactory-user';
import { MinFactoryUserDto } from '../models/dtos/minfactory-user.dto';
import { MinFactoryUserEntity } from '../models/entities/minfactory-user.entity';
import { MinFactoryUserRepository } from '../repositories/minfactory-user.repository';
import { AuthenticationService } from '../../../core/authentication/services/authentication.service';

@Injectable()
export class MinFactoryUserService {
  constructor(
    private readonly userRepository: MinFactoryUserRepository,
    private readonly authenticationService: AuthenticationService,
  ) {}

  public async createUser(user: MinFactoryUser, requestId: string): Promise<MinFactoryUserDto> {
    const { firebaseUid, email } = user;
    if (user.id) {
      return MinFactoryUserDomainMapper.domainToDto(user);
    }

    const existingUserByEmail: MinFactoryUserEntity | null = await this.findByEmailOrNull(email, requestId);

    if (existingUserByEmail) {
      throw new ConflictException('User already registered');
    }

    const entity: MinFactoryUserEntity = MinFactoryUserDomainMapper.domainToEntity(user);

    try {
      const savedEntity: MinFactoryUserEntity = await this.userRepository.save(entity, requestId);
      return this.entityToDto(savedEntity);
    } catch (error) {
      if (!this.isDuplicateUserError(error)) {
        throw error;
      }

      const duplicatedUserByFirebaseUid: MinFactoryUserEntity | null = await this.findByFirebaseUidOrNull(firebaseUid, requestId);

      if (duplicatedUserByFirebaseUid) {
        return this.entityToDto(duplicatedUserByFirebaseUid);
      }

      const duplicatedUserByEmail: MinFactoryUserEntity | null = await this.findByEmailOrNull(email, requestId);

      if (duplicatedUserByEmail) {
        throw new ConflictException('User already registered');
      }

      throw error;
    }
  }

  public async deleteMe(user: MinFactoryUser, requestId: string): Promise<void> {
    const { firebaseUid } = user;

    try {
      await this.authenticationService.deleteUser(firebaseUid);
    } catch (error) {
      if (!this.isFirebaseUserNotFoundError(error)) {
        throw error;
      }
    }

    await this.userRepository.deleteById(user.id, requestId);
  }

  public getMe(user: MinFactoryUser): MinFactoryUserDto {
    return MinFactoryUserDomainMapper.domainToDto(user);
  }

  public async findByFirebaseUid(firebaseUid: string, requestId: string): Promise<MinFactoryUser> {
    const entity: MinFactoryUserEntity = await this.userRepository.findByFirebaseUid(firebaseUid, requestId);
    return MinFactoryUserEntityMapper.entityToDomain(entity);
  }

  private entityToDto(entity: MinFactoryUserEntity): MinFactoryUserDto {
    const savedDomain: MinFactoryUser = MinFactoryUserEntityMapper.entityToDomain(entity);

    return MinFactoryUserDomainMapper.domainToDto(savedDomain);
  }

  private async findByEmailOrNull(email: string, requestId: string): Promise<MinFactoryUserEntity | null> {
    try {
      return await this.userRepository.findByEmail(email, requestId);
    } catch (error) {
      if (error instanceof NotFoundException) {
        return null;
      }

      throw error;
    }
  }

  private async findByFirebaseUidOrNull(firebaseUid: string, requestId: string): Promise<MinFactoryUserEntity | null> {
    try {
      return await this.userRepository.findByFirebaseUid(firebaseUid, requestId);
    } catch (error) {
      if (error instanceof NotFoundException) {
        return null;
      }

      throw error;
    }
  }

  private isFirebaseUserNotFoundError(error: unknown): boolean {
    if (!error || typeof error !== 'object') {
      return false;
    }

    return (error as { code?: string }).code === 'auth/user-not-found';
  }

  private isDuplicateUserError(error: unknown): boolean {
    if (!error || typeof error !== 'object') {
      return false;
    }

    const driverError = error as {
      driverError?: {
        code?: string;
        errno?: number;
      };
    };

    return driverError.driverError?.code === 'ER_DUP_ENTRY' || driverError.driverError?.errno === 1062;
  }
}
