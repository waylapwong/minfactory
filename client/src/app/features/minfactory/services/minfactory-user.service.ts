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
  public readonly profileViewModel: Signal<MinFactoryProfileViewModel | null> = computed(() => {
    const user: MinFactoryUser | null = this.cachedUser();
    return user ? MinFactoryViewmodelMapper.domainToProfileViewModel(user) : null;
  });

  private readonly cachedUser: WritableSignal<MinFactoryUser | null> = signal(null);

  constructor(private readonly userRepository: MinFactoryUserRepository) {}

  public clearUserCache(): void {
    this.cachedUser.set(null);
  }

  public async loadProfile(): Promise<void> {
    const dto: MinFactoryUserDto = await this.userRepository.get();
    const domain: MinFactoryUser = MinFactoryDtoMapper.userDtoToDomain(dto);
    this.cachedUser.set(domain);
  }
}
