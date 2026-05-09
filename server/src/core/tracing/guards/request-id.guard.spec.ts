import { BadRequestException, ExecutionContext } from '@nestjs/common';
import { RequestIdGuard } from './request-id.guard';

function createExecutionContext(requestId?: string | string[]): ExecutionContext {
  const request = {
    headers: {
      'x-request-id': requestId,
    },
  };
  return {
    switchToHttp: () => ({
      getRequest: () => request,
    }),
  } as unknown as ExecutionContext;
}

describe('RequestIdGuard', () => {
  let guard: RequestIdGuard;

  beforeEach(() => {
    guard = new RequestIdGuard();
  });

  it('should allow request when request id header is present', () => {
    const context = createExecutionContext('request-123');

    const result = guard.canActivate(context);

    expect(result).toBe(true);
  });

  it('should allow request when first request id header value is present', () => {
    const context = createExecutionContext(['request-123', 'request-456']);

    const result = guard.canActivate(context);

    expect(result).toBe(true);
  });

  it('should throw BadRequestException when request id header is missing', () => {
    const context = createExecutionContext();

    expect(() => guard.canActivate(context)).toThrow(BadRequestException);
  });

  it('should throw BadRequestException when request id header is empty', () => {
    const context = createExecutionContext('');

    expect(() => guard.canActivate(context)).toThrow(BadRequestException);
  });

  it('should throw BadRequestException when request id header is whitespace', () => {
    const context = createExecutionContext('   ');

    expect(() => guard.canActivate(context)).toThrow(BadRequestException);
  });
});
