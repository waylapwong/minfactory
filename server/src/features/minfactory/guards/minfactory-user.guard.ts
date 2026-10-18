import { CanActivate, ExecutionContext, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { RequestWithIdentity } from '../../../core/authentication/models/request-with-identity';
import { ALLOW_WITHOUT_ACCOUNT } from '../../../core/authorization/decorators/allow-unregistered-user.decorator';
import { MinFactoryUserIdentityMapper } from '../mapper/minfactory-user-identity.mapper';
import { MinFactoryUser } from '../models/domains/minfactory-user';
import { MinFactoryUserService } from '../services/minfactory-user.service';

@Injectable()
export class MinFactoryUserGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly userService: MinFactoryUserService,
  ) {}

  public async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context
      .switchToHttp()
      .getRequest<Request & { user?: MinFactoryUser } & Partial<RequestWithIdentity>>();
    if (!request.identity) {
      throw new UnauthorizedException('Authentication required');
    }

    try {
      request.user = await this.userService.findByFirebaseUid(
        request.identity.uid,
        request.headers['x-request-id']?.toString() ?? '',
      );
    } catch (error) {
      const allowWithoutAccount: boolean | undefined = this.reflector.getAllAndOverride<boolean>(
        ALLOW_WITHOUT_ACCOUNT,
        [context.getHandler(), context.getClass()],
      );
      if (!(error instanceof NotFoundException) || !allowWithoutAccount) {
        throw error;
      }
      request.user = MinFactoryUserIdentityMapper.identityToDomain(request.identity);
    }

    return true;
  }
}
