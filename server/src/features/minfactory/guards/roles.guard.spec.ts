import { ExecutionContext, ForbiddenException, NotFoundException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from 'src/core/authentication/decorators/roles.decorator';
import { MinFactoryRole } from 'src/shared/enums/minfactory-role.enum';
import { MinFactoryUserRepository } from '../repositories/minfactory-user.repository';
import { MINFACTORY_USER_REPOSITORY_MOCK } from '../mocks/minfactory-user.repository.mock';
import { RolesGuard } from './roles.guard';

function createExecutionContext(firebaseUid: string = 'firebase-uid-123'): ExecutionContext {
  const request = {
    firebaseUser: { firebaseUid, email: 'user@example.com' },
  };
  return {
    switchToHttp: () => ({
      getRequest: () => request,
    }),
    getHandler: () => ({}),
    getClass: () => ({}),
  } as unknown as ExecutionContext;
}

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: jest.Mocked<Reflector>;

  beforeEach(() => {
    reflector = {
      getAllAndOverride: jest.fn(),
    } as unknown as jest.Mocked<Reflector>;

    guard = new RolesGuard(reflector, MINFACTORY_USER_REPOSITORY_MOCK as unknown as MinFactoryUserRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should allow access when no roles are required', async () => {
    reflector.getAllAndOverride.mockReturnValue(undefined);

    const result = await guard.canActivate(createExecutionContext());

    expect(result).toBe(true);
  });

  it('should allow access when required roles list is empty', async () => {
    reflector.getAllAndOverride.mockReturnValue([]);

    const result = await guard.canActivate(createExecutionContext());

    expect(result).toBe(true);
  });

  it('should allow access when user has required Admin role', async () => {
    reflector.getAllAndOverride.mockReturnValue([MinFactoryRole.Admin]);
    MINFACTORY_USER_REPOSITORY_MOCK.findByFirebaseUid.mockResolvedValue({
      role: MinFactoryRole.Admin,
    });

    const result = await guard.canActivate(createExecutionContext());

    expect(result).toBe(true);
    expect(MINFACTORY_USER_REPOSITORY_MOCK.findByFirebaseUid).toHaveBeenCalledWith('firebase-uid-123');
  });

  it('should throw ForbiddenException when user has User role but Admin is required', async () => {
    reflector.getAllAndOverride.mockReturnValue([MinFactoryRole.Admin]);
    MINFACTORY_USER_REPOSITORY_MOCK.findByFirebaseUid.mockResolvedValue({
      role: MinFactoryRole.User,
    });

    await expect(guard.canActivate(createExecutionContext())).rejects.toThrow(ForbiddenException);
  });

  it('should check roles against correct metadata key', async () => {
    reflector.getAllAndOverride.mockReturnValue([MinFactoryRole.Admin]);
    MINFACTORY_USER_REPOSITORY_MOCK.findByFirebaseUid.mockResolvedValue({
      role: MinFactoryRole.Admin,
    });

    const context = createExecutionContext();
    await guard.canActivate(context);

    expect(reflector.getAllAndOverride).toHaveBeenCalledWith(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
  });

  it('should throw ForbiddenException when user is not found in database', async () => {
    reflector.getAllAndOverride.mockReturnValue([MinFactoryRole.Admin]);
    MINFACTORY_USER_REPOSITORY_MOCK.findByFirebaseUid.mockRejectedValue(new NotFoundException());

    await expect(guard.canActivate(createExecutionContext())).rejects.toThrow(ForbiddenException);
  });
});
