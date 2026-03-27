import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { MinFactoryUserEntity } from '../models/entities/minfactory-user.entity';
import { MinFactoryUserRepository } from '../repositories/minfactory-user.repository';
import { ROLES_KEY } from 'src/core/authentication/decorators/roles.decorator';
import { AuthenticatedRequest } from 'src/core/authentication/models/authenticated-request';
import { MinFactoryRole, hasRequiredRole } from 'src/shared/enums/minfactory-role.enum';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly userRepository: MinFactoryUserRepository,
  ) {}

  public async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles: MinFactoryRole[] | undefined = this.reflector.getAllAndOverride<MinFactoryRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request: Request = context.switchToHttp().getRequest<Request>();
    const firebaseUser = (request as AuthenticatedRequest).firebaseUser;

    if (!firebaseUser?.firebaseUid) {
      throw new ForbiddenException('Authentication required');
    }

    const firebaseUid = firebaseUser.firebaseUid;
    const user: MinFactoryUserEntity = await this.userRepository.findByFirebaseUid(firebaseUid);

    if (!user) {
      throw new ForbiddenException('Insufficient permissions');
    }

    if (!requiredRoles.some((role) => hasRequiredRole(user.role, role))) {
      throw new ForbiddenException('Insufficient permissions');
    }

    return true;
  }
}
