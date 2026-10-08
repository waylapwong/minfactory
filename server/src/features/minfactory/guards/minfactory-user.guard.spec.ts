import { ExecutionContext, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { MINFACTORY_USER_SERVICE_MOCK } from '../mocks/minfactory-user.service.mock';
import { MinFactoryUser } from '../models/domains/minfactory-user';
import { MinFactoryRole } from '../../../shared/enums/minfactory-role.enum';
import { MinFactoryUserService } from '../services/minfactory-user.service';
import { ALLOW_UNREGISTERED_USER } from '../decorators/allow-unregistered-user.decorator';
import { MinFactoryUserGuard } from './minfactory-user.guard';

function createExecutionContext(firebaseIdentity?: { email: string; uid: string }): ExecutionContext {
  const request = {
    firebaseIdentity,
    headers: { 'x-request-id': 'test-request-id' },
  };
  return {
    switchToHttp: () => ({ getRequest: () => request }),
    getHandler: () => ({}),
    getClass: () => ({}),
  } as unknown as ExecutionContext;
}

describe('MinFactoryUserGuard', () => {
  let guard: MinFactoryUserGuard;
  let reflector: jest.Mocked<Reflector>;

  beforeEach(() => {
    reflector = {
      getAllAndOverride: jest.fn().mockReturnValue(undefined),
    } as unknown as jest.Mocked<Reflector>;
    guard = new MinFactoryUserGuard(reflector, MINFACTORY_USER_SERVICE_MOCK as unknown as MinFactoryUserService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('loads the domain user once and attaches it to request.user', async () => {
    const user = Object.assign(new MinFactoryUser(), { id: 'user-1', role: MinFactoryRole.User });
    MINFACTORY_USER_SERVICE_MOCK.findByFirebaseUid.mockResolvedValue(user);
    const context = createExecutionContext({ email: 'user@example.com', uid: 'firebase-uid' });

    await expect(guard.canActivate(context)).resolves.toBe(true);

    expect(MINFACTORY_USER_SERVICE_MOCK.findByFirebaseUid).toHaveBeenCalledWith('firebase-uid', 'test-request-id');
    expect(context.switchToHttp().getRequest().user).toBe(user);
  });

  it('uses a provisional domain user only on routes allowing registration', async () => {
    MINFACTORY_USER_SERVICE_MOCK.findByFirebaseUid.mockRejectedValue(new NotFoundException('User not found'));
    reflector.getAllAndOverride.mockReturnValue(true);
    const context = createExecutionContext({ email: 'user@example.com', uid: 'firebase-uid' });

    await expect(guard.canActivate(context)).resolves.toBe(true);

    expect(reflector.getAllAndOverride).toHaveBeenCalledWith(ALLOW_UNREGISTERED_USER, [context.getHandler(), context.getClass()]);
    expect(context.switchToHttp().getRequest().user).toMatchObject({
      email: 'user@example.com',
      firebaseUid: 'firebase-uid',
      role: MinFactoryRole.User,
    });
  });

  it('preserves 404 for a valid Firebase identity without a registered user', async () => {
    MINFACTORY_USER_SERVICE_MOCK.findByFirebaseUid.mockRejectedValue(new NotFoundException('User not found'));
    const context = createExecutionContext({ email: 'user@example.com', uid: 'firebase-uid' });

    await expect(guard.canActivate(context)).rejects.toThrow(NotFoundException);
  });

  it('returns 401 when no authenticated Firebase identity is present', async () => {
    const context = createExecutionContext();

    await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
    expect(MINFACTORY_USER_SERVICE_MOCK.findByFirebaseUid).not.toHaveBeenCalled();
  });
});
