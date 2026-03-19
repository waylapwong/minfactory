import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthenticationService } from './authentication.service';
import { AuthenticationGuard } from './authentication.guard';

describe('AuthenticationGuard', () => {
  const mockAuthenticationService = {
    verifyIdToken: jest.fn(),
  };

  let guard: AuthenticationGuard;

  beforeEach(() => {
    guard = new AuthenticationGuard(mockAuthenticationService as unknown as AuthenticationService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const createExecutionContext = (authorization?: string): ExecutionContext => {
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
  };

  it('should allow request and attach authUser when token is valid', async () => {
    const context = createExecutionContext('Bearer valid-token');
    mockAuthenticationService.verifyIdToken.mockResolvedValue({
      uid: 'firebase-uid-123',
      email: 'user@example.com',
    });

    const result = await guard.canActivate(context);

    expect(result).toBe(true);
    expect(mockAuthenticationService.verifyIdToken).toHaveBeenCalledWith('valid-token');

    const request = context.switchToHttp().getRequest();
    expect(request.authUser).toEqual({
      firebaseUid: 'firebase-uid-123',
      email: 'user@example.com',
    });
  });

  it('should throw UnauthorizedException when header is missing', async () => {
    const context = createExecutionContext();

    await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
  });

  it('should throw UnauthorizedException when token is invalid', async () => {
    const context = createExecutionContext('Bearer invalid-token');
    mockAuthenticationService.verifyIdToken.mockRejectedValue(new Error('invalid token'));

    await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
  });

  it('should throw UnauthorizedException when required claims are missing', async () => {
    const context = createExecutionContext('Bearer valid-token');
    mockAuthenticationService.verifyIdToken.mockResolvedValue({ uid: '', email: '' });

    await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
  });
});
