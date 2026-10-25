import { ExecutionContext, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ThrottlerException, ThrottlerGuard } from '@nestjs/throttler';

@Injectable()
export class MinAdventSharedThrottlerGuard extends ThrottlerGuard {
  public override async canActivate(context: ExecutionContext): Promise<boolean> {
    const response: { setHeader: (name: string, value: string) => void } = context
      .switchToHttp()
      .getResponse<{ setHeader: (name: string, value: string) => void }>();
    response.setHeader('Cache-Control', 'no-store');
    response.setHeader('Referrer-Policy', 'no-referrer');

    try {
      return await super.canActivate(context);
    } catch (error: unknown) {
      if (error instanceof ThrottlerException) {
        throw new HttpException(
          {
            code: 'SHARED_RATE_LIMITED',
            message: 'Zu viele Anfragen. Bitte versuche es später erneut.',
          },
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }
      throw error;
    }
  }
}
