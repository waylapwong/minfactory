import { CanActivate, ExecutionContext, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { AuthenticatedRequest } from '../../../core/authentication/models/authenticated-request';
import { MinFactoryUser } from '../models/domains/minfactory-user';
import { MinFactoryUserIdentityMapper } from '../mapper/minfactory-user-identity.mapper';
import { MinFactoryUserService } from '../services/minfactory-user.service';
import { ALLOW_UNREGISTERED_USER } from '../decorators/allow-unregistered-user.decorator';

@Injectable()
export class MinFactoryUserGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly userService: MinFactoryUserService,
  ) {}

  public async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request & { user?: MinFactoryUser } & Partial<AuthenticatedRequest>>();
    if (!request.firebaseIdentity) {
      throw new UnauthorizedException('Authentication required');
    }

    try {
      request.user = await this.userService.findByFirebaseUid(
        request.firebaseIdentity.uid,
        request.headers['x-request-id']?.toString() ?? '',
      );
    } catch (error) {
      const allowUnregisteredUser: boolean | undefined = this.reflector.getAllAndOverride<boolean>(ALLOW_UNREGISTERED_USER, [
        context.getHandler(),
        context.getClass(),
      ]);
      if (!(error instanceof NotFoundException) || !allowUnregisteredUser) {
        throw error;
      }
      request.user = MinFactoryUserIdentityMapper.identityToDomain(request.firebaseIdentity);
    }

    return true;
  }
}
