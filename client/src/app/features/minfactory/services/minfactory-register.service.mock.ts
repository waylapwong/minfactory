import { MinFactoryUser } from '../models/domains/minfactory-user';

export const MINFACTORY_REGISTER_SERVICE_MOCK = {
  registerUser: jasmine
    .createSpy('registerUser')
    .and.callFake(
      async () => new MinFactoryUser({ email: 'user@example.com', createdAt: new Date('2026-03-19T10:00:00.000Z') }),
    ),
};
