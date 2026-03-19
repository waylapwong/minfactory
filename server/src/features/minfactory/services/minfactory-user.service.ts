import { ConflictException, Injectable } from '@nestjs/common';
import { MinFactoryUserDomainMapper } from '../mapper/minfactory-user-domain.mapper';
import { MinFactoryUserEntityMapper } from '../mapper/minfactory-user-entity.mapper';
import { MinFactoryUser } from '../models/domains/minfactory-user';
import { MinFactoryUserDto } from '../models/dtos/minfactory-user.dto';
import { MinFactoryUserEntity } from '../models/entities/minfactory-user.entity';
import { MinFactoryUserRepository } from '../repositories/minfactory-user.repository';

@Injectable()
export class MinFactoryUserService {
  constructor(private readonly userRepository: MinFactoryUserRepository) {}

  public async createUser(firebaseUid: string, email: string): Promise<MinFactoryUserDto> {
    const existingUserByFirebaseUid: MinFactoryUserEntity | null =
      await this.userRepository.findByFirebaseUid(firebaseUid);

    if (existingUserByFirebaseUid) {
      return this.entityToDto(existingUserByFirebaseUid);
    }

    const existingUserByEmail: MinFactoryUserEntity | null = await this.userRepository.findByEmail(email);

    if (existingUserByEmail) {
      throw new ConflictException('User already registered');
    }

    const domain: MinFactoryUser = new MinFactoryUser();
    domain.firebaseUid = firebaseUid;
    domain.email = email;
    const entity: MinFactoryUserEntity = MinFactoryUserDomainMapper.domainToEntity(domain);

    try {
      const savedEntity: MinFactoryUserEntity = await this.userRepository.save(entity);

      return this.entityToDto(savedEntity);
    } catch (error) {
      if (!this.isDuplicateUserError(error)) {
        throw error;
      }

      const duplicatedUserByFirebaseUid: MinFactoryUserEntity | null =
        await this.userRepository.findByFirebaseUid(firebaseUid);

      if (duplicatedUserByFirebaseUid) {
        return this.entityToDto(duplicatedUserByFirebaseUid);
      }

      const duplicatedUserByEmail: MinFactoryUserEntity | null = await this.userRepository.findByEmail(email);

      if (duplicatedUserByEmail) {
        throw new ConflictException('User already registered');
      }

      throw error;
    }
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
}
