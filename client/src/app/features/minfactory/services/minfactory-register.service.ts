import { Injectable } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { MinFactoryDtoMapper } from '../mapper/minfactory-dto.mapper';
import { MinFactoryUser } from '../models/domains/minfactory-user';
import { MinFactoryUserRepository } from '../repositories/minfactory-user.repository';

@Injectable({
  providedIn: 'root',
})
export class MinFactoryRegisterService {
  constructor(
    private readonly authService: AuthService,
    private readonly userRepository: MinFactoryUserRepository,
  ) {}

  public async registerUser(email: string, password: string): Promise<MinFactoryUser> {
    await this.authService.registerWithEmailAndPassword(email, password);

    const userDto = await this.userRepository.createUser();

    return MinFactoryDtoMapper.userDtoToDomain(userDto);
  }
}
