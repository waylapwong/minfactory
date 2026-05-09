import { BadRequestException, CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class RequestIdGuard implements CanActivate {
  public canActivate(context: ExecutionContext): boolean {
    const request: Request = context.switchToHttp().getRequest<Request>();
    const requestId: string | undefined = this.extractRequestId(request.headers['x-request-id']);
    if (!requestId) {
      throw new BadRequestException('Missing X-Request-Id header');
    }
    return true;
  }

  private extractRequestId(header?: string | string[]): string | undefined {
    const requestId: string | undefined = Array.isArray(header) ? header[0] : header;
    const trimmedRequestId: string | undefined = requestId?.trim();
    return trimmedRequestId;
  }
}
