import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { MinFactoryUserDomainMapper } from '../mapper/minfactory-user-domain.mapper';
import { MinFactoryUserDtoMapper } from '../mapper/minfactory-user-dto.mapper';
import { MinFactoryUserEntityMapper } from '../mapper/minfactory-user-entity.mapper';
import { MinFactoryUser } from '../models/domains/minfactory-user';
import { MinFactoryUserDto } from '../models/dtos/minfactory-user.dto';
import { MinFactoryUserEntity } from '../models/entities/minfactory-user.entity';
import { MinFactoryUserRepository } from '../repositories/minfactory-user.repository';
import { FirebaseUserDto } from 'src/core/authentication/models/firebase-user.dto';

@Injectable()
export class MinFactoryUserService {
  constructor(private readonly userRepository: MinFactoryUserRepository) {}

  public async findEntityByFirebaseUid(user: FirebaseUserDto): Promise<MinFactoryUserEntity> {
    const { firebaseUid } = user;
    return await this.userRepository.findByFirebaseUid(firebaseUid);
  }

  public async createUser(user: FirebaseUserDto): Promise<MinFactoryUserDto> {
    const { firebaseUid, email } = user;
    const existingUserByFirebaseUid: MinFactoryUserEntity | null = await this.findByFirebaseUidOrNull(firebaseUid);

    if (existingUserByFirebaseUid) {
      return this.entityToDto(existingUserByFirebaseUid);
    }

    const existingUserByEmail: MinFactoryUserEntity | null = await this.findByEmailOrNull(email);

    if (existingUserByEmail) {
      throw new ConflictException('User already registered');
    }

    const domain: MinFactoryUser = MinFactoryUserDtoMapper.dtoToDomain(user);
    const entity: MinFactoryUserEntity = MinFactoryUserDomainMapper.domainToEntity(domain);

    try {
      const savedEntity: MinFactoryUserEntity = await this.userRepository.save(entity);
      return this.entityToDto(savedEntity);
    } catch (error) {
      if (!this.isDuplicateUserError(error)) {
        throw error;
      }

      const duplicatedUserByFirebaseUid: MinFactoryUserEntity | null = await this.findByFirebaseUidOrNull(firebaseUid);

      if (duplicatedUserByFirebaseUid) {
        return this.entityToDto(duplicatedUserByFirebaseUid);
      }

      const duplicatedUserByEmail: MinFactoryUserEntity | null = await this.findByEmailOrNull(email);

      if (duplicatedUserByEmail) {
        throw new ConflictException('User already registered');
      }

      throw error;
    }
  }

  public async getMe(user: FirebaseUserDto): Promise<MinFactoryUserDto> {
    const { firebaseUid } = user;
    const entity: MinFactoryUserEntity = await this.userRepository.findByFirebaseUid(firebaseUid);

    return this.entityToDto(entity);
  }

  private entityToDto(entity: MinFactoryUserEntity): MinFactoryUserDto {
    const savedDomain: MinFactoryUser = MinFactoryUserEntityMapper.entityToDomain(entity);

    return MinFactoryUserDomainMapper.domainToDto(savedDomain);
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

  private async findByFirebaseUidOrNull(firebaseUid: string): Promise<MinFactoryUserEntity | null> {
    try {
      return await this.userRepository.findByFirebaseUid(firebaseUid);
    } catch (error) {
      if (error instanceof NotFoundException) {
        return null;
      }

      throw error;
    }
  }

  private async findByEmailOrNull(email: string): Promise<MinFactoryUserEntity | null> {
    try {
      return await this.userRepository.findByEmail(email);
    } catch (error) {
      if (error instanceof NotFoundException) {
        return null;
      }

      throw error;
    }
  }
}
