import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { MinFactoryUserEntity } from '../../../features/minfactory/models/entities/minfactory-user.entity';
import { MinFactoryUserRepository } from '../../../features/minfactory/repositories/minfactory-user.repository';
import { MinFactoryRole, hasRequiredRole } from '../../../shared/enums/minfactory-role.enum';
import { ROLES_KEY } from '../../authentication/decorators/roles.decorator';
import { AuthenticatedRequest } from '../../authentication/models/authenticated-request';

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

    if (!firebaseUser?.uid) {
      throw new ForbiddenException('Authentication required');
    }

    const firebaseUid = firebaseUser.uid;
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
