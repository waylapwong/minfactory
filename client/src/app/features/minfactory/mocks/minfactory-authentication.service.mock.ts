import { MinFactoryUser } from '../models/domains/minfactory-user';

export const MINFACTORY_AUTHENTICATION_SERVICE_MOCK = {
  loginUser: jasmine
    .createSpy('loginUser')
    .and.callFake(
      async () => new MinFactoryUser({ email: 'user@example.com', createdAt: new Date('2026-03-19T10:00:00.000Z') }),
    ),
  logoutUser: jasmine.createSpy('logoutUser').and.resolveTo(),
  registerUser: jasmine
    .createSpy('registerUser')
    .and.callFake(
      async () => new MinFactoryUser({ email: 'user@example.com', createdAt: new Date('2026-03-19T10:00:00.000Z') }),
    ),
};
