import { MinFactoryProfileViewModel } from '../models/viewmodels/minfactory-profile.viewmodel';

export const MINFACTORY_PROFILE_SERVICE_MOCK = {
  loadProfile: jasmine.createSpy('loadProfile').and.callFake(
    async () =>
      ({
        createdAt: '19.03.2026, 11:00',
        email: 'user@example.com',
      }) as MinFactoryProfileViewModel,
  ),
};
