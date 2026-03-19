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
    // Doppelte Registrierung prüfen
    const alreadyExists: boolean = await this.userRepository.existsByFirebaseUidOrEmail(firebaseUid, email);
    if (alreadyExists) {
      throw new ConflictException('User already registered');
    }

    // Domain-Objekt erzeugen
    const domain: MinFactoryUser = new MinFactoryUser();
    domain.firebaseUid = firebaseUid;
    domain.email = email;

    // Mapping und Persistenz
    const entity: MinFactoryUserEntity = MinFactoryUserDomainMapper.domainToEntity(domain);
    const savedEntity: MinFactoryUserEntity = await this.userRepository.save(entity);

    // Mapping für Response
    const savedDomain: MinFactoryUser = MinFactoryUserEntityMapper.entityToDomain(savedEntity);
    const dto: MinFactoryUserDto = MinFactoryUserDomainMapper.domainToDto(savedDomain);

    return dto;
  }
}
