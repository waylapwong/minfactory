import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { MinFactoryApiService, MinFactoryUserDto } from '../../../core/generated';

@Injectable({
  providedIn: 'root',
})
export class MinFactoryUserRepository {
  constructor(private readonly apiService: MinFactoryApiService) {}

  public async createUser(): Promise<MinFactoryUserDto> {
    return await firstValueFrom(this.apiService.createMinFactoryUser());
  }

  public async getMe(): Promise<MinFactoryUserDto> {
    return await firstValueFrom(this.apiService.getMinFactoryUserMe());
  }
}
