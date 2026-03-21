import { ExecutionContext, createParamDecorator } from '@nestjs/common';
import { Request } from 'express';
import { AuthenticatedRequest } from '../models/authenticated-request.interface';
import { FirebaseUser } from '../models/firebase-user.interface';

export const User = createParamDecorator((data: unknown, ctx: ExecutionContext): FirebaseUser => {
  const request: Request = ctx.switchToHttp().getRequest<Request>();
  return (request as AuthenticatedRequest).firebaseUser;
});
