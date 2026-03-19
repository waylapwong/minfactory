import { Injectable } from '@angular/core';
import { MinFactoryDtoMapper } from '../mapper/minfactory-dto.mapper';
import { MinFactoryViewmodelMapper } from '../mapper/minfactory-viewmodel.mapper';
import { MinFactoryProfileViewModel } from '../models/viewmodels/minfactory-profile.viewmodel';
import { MinFactoryUserRepository } from '../repositories/minfactory-user.repository';

@Injectable({
  providedIn: 'root',
})
export class MinFactoryProfileService {
  constructor(private readonly userRepository: MinFactoryUserRepository) {}

  public async loadProfile(): Promise<MinFactoryProfileViewModel> {
    const userDto = await this.userRepository.getMe();
    const domain = MinFactoryDtoMapper.userDtoToDomain(userDto);
    return MinFactoryViewmodelMapper.domainToProfileViewModel(domain);
  }
}
