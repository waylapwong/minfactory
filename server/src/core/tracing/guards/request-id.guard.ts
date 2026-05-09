import { BadRequestException, CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Request } from 'express';

const UUID_V4_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

@Injectable()
export class RequestIdGuard implements CanActivate {
  public canActivate(context: ExecutionContext): boolean {
    const request: Request = context.switchToHttp().getRequest<Request>();
    const requestId: string | undefined = this.extractRequestId(request.headers['x-request-id']);
    if (!requestId || !UUID_V4_PATTERN.test(requestId)) {
      throw new BadRequestException('X-Request-Id header must be a valid UUID v4');
    }
    return true;
  }

  private extractRequestId(header?: string | string[]): string | undefined {
    const raw: string | undefined = Array.isArray(header) ? header[0] : header;
    return raw?.trim();
  }
}
