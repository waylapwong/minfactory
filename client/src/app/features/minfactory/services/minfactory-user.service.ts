import { Injectable, Signal, WritableSignal, computed, signal } from '@angular/core';
import { MinFactoryUserDto } from '../../../core/generated';
import { MinFactoryDtoMapper } from '../mapper/minfactory-dto.mapper';
import { MinFactoryViewmodelMapper } from '../mapper/minfactory-viewmodel.mapper';
import { MinFactoryUser } from '../models/domains/minfactory-user';
import { MinFactoryProfileViewModel } from '../models/viewmodels/minfactory-profile.viewmodel';
import { MinFactoryUserRepository } from '../repositories/minfactory-user.repository';

@Injectable({
  providedIn: 'root',
})
export class MinFactoryUserService {
  private readonly cachedUser: WritableSignal<MinFactoryUser | null> = signal(null);

  public readonly profile: Signal<MinFactoryProfileViewModel | null> = computed(() => {
    const user: MinFactoryUser | null = this.cachedUser();
    return user ? MinFactoryViewmodelMapper.domainToProfileViewModel(user) : null;
  });

  constructor(private readonly userRepository: MinFactoryUserRepository) {}

  public async loadProfile(): Promise<void> {
    const userDto: MinFactoryUserDto = await this.userRepository.getMe();
    const domain: MinFactoryUser = MinFactoryDtoMapper.userDtoToDomain(userDto);
    this.cachedUser.set(domain);
  }

  public clearProfileCache(): void {
    this.cachedUser.set(null);
  }
}
