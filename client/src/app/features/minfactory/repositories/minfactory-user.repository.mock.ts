import { MinFactoryUserDto } from '../../../core/generated';

export const MINFACTORY_USER_REPOSITORY_MOCK = {
  createUser: jasmine.createSpy('createUser').and.callFake(
    async () =>
      ({
        createdAt: '2026-03-19T10:00:00.000Z',
        email: 'user@example.com',
      }) as MinFactoryUserDto,
  ),
  getMe: jasmine.createSpy('getMe').and.callFake(
    async () =>
      ({
        createdAt: '2026-03-19T10:00:00.000Z',
        email: 'user@example.com',
      }) as MinFactoryUserDto,
  ),
};
