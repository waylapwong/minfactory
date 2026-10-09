import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AUTHENTICATION_SERVICE_MOCK } from '../mocks/authentication.service.mock';
import { AuthenticationService } from '../services/authentication.service';
import { FirebaseGuard } from './firebase.guard';

function createExecutionContext(authorization?: string): ExecutionContext {
  const request = {
    headers: {
      authorization,
    },
  };
  return {
    switchToHttp: () => ({
      getRequest: () => request,
    }),
  } as unknown as ExecutionContext;
}

describe('FirebaseGuard', () => {
  let guard: FirebaseGuard;

  beforeEach(() => {
    guard = new FirebaseGuard(AUTHENTICATION_SERVICE_MOCK as unknown as AuthenticationService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should allow request and attach Firebase identity when token is valid', async () => {
    const context = createExecutionContext('Bearer valid-token');
    AUTHENTICATION_SERVICE_MOCK.verifyIdToken.mockResolvedValue({
      uid: 'firebase-uid-123',
      email: 'user@example.com',
    });

    const result = await guard.canActivate(context);

    expect(result).toBe(true);
    expect(AUTHENTICATION_SERVICE_MOCK.verifyIdToken).toHaveBeenCalledWith('valid-token');

    const request = context.switchToHttp().getRequest();
    expect(request.firebaseUser).toEqual({
      uid: 'firebase-uid-123',
      email: 'user@example.com',
    });
  });

  it('should throw UnauthorizedException when header is missing', async () => {
    const context = createExecutionContext();

    await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
  });

  it('should throw UnauthorizedException when token is invalid', async () => {
    const context = createExecutionContext('Bearer invalid-token');
    AUTHENTICATION_SERVICE_MOCK.verifyIdToken.mockRejectedValue(new Error('invalid token'));

    await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
  });

  it('should throw UnauthorizedException when required claims are missing', async () => {
    const context = createExecutionContext('Bearer valid-token');
    AUTHENTICATION_SERVICE_MOCK.verifyIdToken.mockResolvedValue({ uid: '', email: '' });

    await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
  });

  it('should throw UnauthorizedException when uid is present but email is undefined', async () => {
    const context = createExecutionContext('Bearer valid-token');
    AUTHENTICATION_SERVICE_MOCK.verifyIdToken.mockResolvedValue({ uid: 'valid-uid', email: undefined });

    await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
  });
});
