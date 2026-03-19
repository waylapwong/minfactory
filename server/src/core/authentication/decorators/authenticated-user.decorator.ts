import { ExecutionContext, createParamDecorator } from '@nestjs/common';
import { Request } from 'express';
import { AuthenticatedRequest, AuthenticatedUser } from '../authentication.guard';

export const User = createParamDecorator((data: unknown, ctx: ExecutionContext): AuthenticatedUser => {
  const request = ctx.switchToHttp().getRequest<Request>();
  return (request as AuthenticatedRequest).authUser;
});
