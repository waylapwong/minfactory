import { WritableSignal, computed, signal } from '@angular/core';
import { MinFactoryRole } from '../../../shared/enums/minfactory-role.enum';
import { MinFactoryProfileViewModel } from '../models/viewmodels/minfactory-profile.viewmodel';

const cachedProfile: WritableSignal<MinFactoryProfileViewModel | null> = signal(null);

export const MINFACTORY_USER_SERVICE_MOCK = {
  profileViewModel: computed((): MinFactoryProfileViewModel | null => cachedProfile()),
  setProfile: jasmine
    .createSpy('setProfile')
    .and.callFake((profile: MinFactoryProfileViewModel | null) => cachedProfile.set(profile)),
  loadProfile: jasmine.createSpy('loadProfile').and.callFake(async (): Promise<void> => {
    MINFACTORY_USER_SERVICE_MOCK.setProfile({
      createdAt: '19.03.2026, 11:00',
      email: 'user@example.com',
      role: MinFactoryRole.User,
    } as MinFactoryProfileViewModel);
  }),
  clearUserCache: jasmine.createSpy('clearUserCache').and.callFake(() => {
    MINFACTORY_USER_SERVICE_MOCK.setProfile(null);
  }),
  ensureProfileLoaded: jasmine.createSpy('ensureProfileLoaded').and.callFake(async (): Promise<void> => {
    if (cachedProfile()) {
      return;
    }
    await MINFACTORY_USER_SERVICE_MOCK.loadProfile();
  }),
};
