import { MinFactoryUserDto } from '../../../core/generated';
import { of } from 'rxjs';

const defaultUserDto: MinFactoryUserDto = {
  createdAt: '2026-03-19T10:00:00.000Z',
  email: 'user@example.com',
  role: MinFactoryUserDto.RoleEnum.User,
};

export const MINFACTORY_API_SERVICE_MOCK = {
  createMinFactoryUser: jasmine.createSpy('createMinFactoryUser').and.returnValue(of(defaultUserDto)),
  deleteMinFactoryUserMe: jasmine.createSpy('deleteMinFactoryUserMe').and.returnValue(of(undefined)),
  getMinFactoryUserMe: jasmine.createSpy('getMinFactoryUserMe').and.returnValue(of(defaultUserDto)),
};
