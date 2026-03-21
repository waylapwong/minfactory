import { MinFactoryUserDto } from '../../../core/generated';

export const MINFACTORY_USER_REPOSITORY_MOCK = {
  create: jasmine.createSpy('create').and.callFake(
    async () =>
      ({
        createdAt: '2026-03-19T10:00:00.000Z',
        email: 'user@example.com',
      }) as MinFactoryUserDto,
  ),
  get: jasmine.createSpy('get').and.callFake(
    async () =>
      ({
        createdAt: '2026-03-19T10:00:00.000Z',
        email: 'user@example.com',
      }) as MinFactoryUserDto,
  ),
};
