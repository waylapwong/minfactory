import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { FirebaseService } from 'src/core/firebase/firebase.service';
import { UserDomainMapper } from '../mapper/user-domain.mapper';
import { UserEntityMapper } from '../mapper/user-entity.mapper';
import { User } from '../models/domains/user';
import { UserDto } from '../models/dtos/user.dto';
import { UserEntity } from '../models/entities/user.entity';
import { UserRepository } from '../repositories/user.repository';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly firebaseService: FirebaseService,
  ) {}

  public async createUser(authorizationHeader: string): Promise<UserDto> {
    // Token aus Header extrahieren
    const token: string = this.extractToken(authorizationHeader);

    // Token verifizieren
    let firebaseUid: string;
    let email: string;

    try {
      const decodedToken = await this.firebaseService.verifyIdToken(token);
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
    const domain: User = new User();
    domain.firebaseUid = firebaseUid;
    domain.email = email;

    // Mapping und Persistenz
    const entity: UserEntity = UserDomainMapper.domainToEntity(domain);
    const savedEntity: UserEntity = await this.userRepository.save(entity);

    // Mapping für Response
    const savedDomain: User = UserEntityMapper.entityToDomain(savedEntity);
    const dto: UserDto = UserDomainMapper.domainToDto(savedDomain);

    return dto;
  }

  private extractToken(authorizationHeader: string): string {
    if (!authorizationHeader || !authorizationHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing or invalid Authorization header');
    }
    return authorizationHeader.slice('Bearer '.length);
  }
}
