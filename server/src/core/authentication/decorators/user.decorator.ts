import { ExecutionContext, createParamDecorator } from '@nestjs/common';
import { Request } from 'express';
import { MinFactoryUser } from '../../../features/minfactory/models/domains/minfactory-user';

export const User = createParamDecorator((data: unknown, ctx: ExecutionContext): MinFactoryUser => {
  const request = ctx.switchToHttp().getRequest<Request & { user: MinFactoryUser }>();
  return request.user;
});
