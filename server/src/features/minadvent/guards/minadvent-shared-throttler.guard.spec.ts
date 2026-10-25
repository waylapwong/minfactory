import { ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ThrottlerModule } from '@nestjs/throttler';
import { MinAdventSharedController } from '../controllers/minadvent-shared.controller';
import { MinAdventSharedThrottlerGuard } from './minadvent-shared-throttler.guard';

function createContext(
  method: string,
  ip: string,
  setHeader = jest.fn(),
  handler: (...args: never[]) => unknown = MinAdventSharedController.prototype.get,
): ExecutionContext {
  const request: { method: string; ip: string; socket: { remoteAddress: string }; headers: {} } = {
    method,
    ip,
    socket: { remoteAddress: ip },
    headers: {},
  };
  const response: { setHeader: jest.Mock } = { setHeader };
  return {
    switchToHttp: () => ({
      getRequest: () => request,
      getResponse: () => response,
    }),
    getHandler: () => handler,
    getClass: () => MinAdventSharedController,
  } as unknown as ExecutionContext;
}

describe('MinAdventSharedThrottlerGuard', () => {
  let guard: MinAdventSharedThrottlerGuard;
  let testingModule: TestingModule;

  beforeEach(async () => {
    testingModule = await Test.createTestingModule({
      imports: [ThrottlerModule.forRoot({ throttlers: [{ ttl: 60_000, limit: 2 }] })],
      providers: [MinAdventSharedThrottlerGuard],
    }).compile();
    await testingModule.init();

    guard = testingModule.get(MinAdventSharedThrottlerGuard);
  });

  afterEach(async () => {
    await testingModule.close();
    jest.useRealTimers();
  });

  it('sets no-store and no-referrer headers', async () => {
    const setHeader: jest.Mock = jest.fn();

    await expect(guard.canActivate(createContext('GET', '192.0.2.1', setHeader))).resolves.toBe(true);
    expect(setHeader).toHaveBeenCalledWith('Cache-Control', 'no-store');
    expect(setHeader).toHaveBeenCalledWith('Referrer-Policy', 'no-referrer');
  });

  it('uses the configured throttler and returns the neutral 429 response', async () => {
    const setHeader: jest.Mock = jest.fn();
    const context: ExecutionContext = createContext('GET', '192.0.2.1', setHeader);

    await guard.canActivate(context);
    await guard.canActivate(context);

    await expect(guard.canActivate(context)).rejects.toMatchObject({
      status: HttpStatus.TOO_MANY_REQUESTS,
      response: {
        code: 'SHARED_RATE_LIMITED',
        message: 'Zu viele Anfragen. Bitte versuche es später erneut.',
      },
    });
    expect(setHeader).toHaveBeenCalledWith('Cache-Control', 'no-store');
    expect(setHeader).toHaveBeenCalledWith('Referrer-Policy', 'no-referrer');
  });

  it('uses the PUT route override instead of the default limit', async () => {
    const context: ExecutionContext = createContext(
      'PUT',
      '192.0.2.1',
      jest.fn(),
      MinAdventSharedController.prototype.openDoor,
    );

    for (let request: number = 0; request < 10; request += 1) {
      await expect(guard.canActivate(context)).resolves.toBe(true);
    }

    await expect(guard.canActivate(context)).rejects.toBeInstanceOf(HttpException);
  });

  it('tracks different client addresses independently', async () => {
    const firstClient: ExecutionContext = createContext('GET', '192.0.2.1');

    await guard.canActivate(firstClient);
    await guard.canActivate(firstClient);

    await expect(guard.canActivate(createContext('GET', '192.0.2.2'))).resolves.toBe(true);
  });

  it('resets the request window after one minute', async () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-10-21T12:00:00.000Z'));
    const context: ExecutionContext = createContext('GET', '192.0.2.1');

    await guard.canActivate(context);
    await guard.canActivate(context);
    jest.advanceTimersByTime(60_000);

    await expect(guard.canActivate(context)).resolves.toBe(true);
  });
});
