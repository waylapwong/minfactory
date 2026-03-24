import { ExecutionContext, createParamDecorator } from '@nestjs/common';
import { Request } from 'express';
import { AuthenticatedRequest } from '../models/authenticated-request';
import { FirebaseUserDto } from '../models/firebase-user.dto';

export const FirebaseUser = createParamDecorator((data: unknown, ctx: ExecutionContext): FirebaseUserDto => {
  const request: Request = ctx.switchToHttp().getRequest<Request>();
  return (request as AuthenticatedRequest).firebaseUser;
});
