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

  it('should allow request when request id header is a valid UUID v4', () => {
    const context = createExecutionContext('550e8400-e29b-4d4a-a716-446655440000');

    const result = guard.canActivate(context);

    expect(result).toBe(true);
  });

  it('should allow request when first value of array header is a valid UUID v4', () => {
    const context = createExecutionContext(['550e8400-e29b-4d4a-a716-446655440000', '660e8400-e29b-4d4a-a716-446655440000']);

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

  it('should throw BadRequestException when request id is an arbitrary string', () => {
    const context = createExecutionContext('request-123');

    expect(() => guard.canActivate(context)).toThrow(BadRequestException);
  });

  it('should throw BadRequestException when request id contains newline characters', () => {
    const context = createExecutionContext('550e8400-e29b-4d4a-a716-446655440000\ninjected-log');

    expect(() => guard.canActivate(context)).toThrow(BadRequestException);
  });

  it('should throw BadRequestException when request id contains carriage return characters', () => {
    const context = createExecutionContext('550e8400-e29b-4d4a-a716-446655440000\rinjected-log');

    expect(() => guard.canActivate(context)).toThrow(BadRequestException);
  });

  it('should throw BadRequestException when request id is not a UUID v4 version digit', () => {
    const context = createExecutionContext('550e8400-e29b-3d4a-a716-446655440000');

    expect(() => guard.canActivate(context)).toThrow(BadRequestException);
  });
});
