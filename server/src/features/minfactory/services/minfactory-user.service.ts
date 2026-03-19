import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { MinFactoryUserDomainMapper } from '../mapper/minfactory-user-domain.mapper';
import { MinFactoryUserEntityMapper } from '../mapper/minfactory-user-entity.mapper';
import { MinFactoryUser } from '../models/domains/minfactory-user';
import { MinFactoryUserDto } from '../models/dtos/minfactory-user.dto';
import { MinFactoryUserEntity } from '../models/entities/minfactory-user.entity';
import { MinFactoryUserRepository } from '../repositories/minfactory-user.repository';
import { AuthenticationService } from 'src/core/authentication/authentication.service';

@Injectable()
export class MinFactoryUserService {
  constructor(
    private readonly userRepository: MinFactoryUserRepository,
    private readonly authenticationService: AuthenticationService,
  ) {}

  public async createUser(authorizationHeader: string): Promise<MinFactoryUserDto> {
    // Token aus Header extrahieren
    const token: string = this.extractToken(authorizationHeader);

    // Token verifizieren
    let firebaseUid: string;
    let email: string;

    try {
      const decodedToken = await this.authenticationService.verifyIdToken(token);
      firebaseUid = decodedToken.uid;
      email = decodedToken.email ?? '';
    } catch {
      throw new UnauthorizedException('Invalid or expired Firebase token');
    }

    if (!email) {
      throw new UnauthorizedException('Firebase token is missing required email claim');
    }

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

  private extractToken(authorizationHeader: string): string {
    if (!authorizationHeader || !authorizationHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing or invalid Authorization header');
    }
    return authorizationHeader.slice('Bearer '.length);
  }
}
