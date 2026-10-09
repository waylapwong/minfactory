import { CanActivate, ExecutionContext, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { RequestWithFirebaseUser } from '../../../core/authentication/models/request-with-firebase-user';
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
    const request = context.switchToHttp().getRequest<Request & { user?: MinFactoryUser } & Partial<RequestWithFirebaseUser>>();
    if (!request.firebaseUser) {
      throw new UnauthorizedException('Authentication required');
    }

    try {
      request.user = await this.userService.findByFirebaseUid(request.firebaseUser.uid, request.headers['x-request-id']?.toString() ?? '');
    } catch (error) {
      const allowUnregisteredUser: boolean | undefined = this.reflector.getAllAndOverride<boolean>(ALLOW_UNREGISTERED_USER, [
        context.getHandler(),
        context.getClass(),
      ]);
      if (!(error instanceof NotFoundException) || !allowUnregisteredUser) {
        throw error;
      }
      request.user = MinFactoryUserIdentityMapper.identityToDomain(request.firebaseUser);
    }

    return true;
  }
}
