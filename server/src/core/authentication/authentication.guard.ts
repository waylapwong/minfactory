import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { AuthenticationService } from './authentication.service';

@Injectable()
export class AuthenticationGuard implements CanActivate {
  constructor(private readonly authenticationService: AuthenticationService) {}

  public async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest<Request>();
    const token: string = this.extractToken(request.headers.authorization);

    let firebaseUid: string;
    let email: string;

    try {
      const decodedToken = await this.authenticationService.verifyIdToken(token);
      firebaseUid = decodedToken.uid;
      email = decodedToken.email ?? '';
    } catch {
      throw new UnauthorizedException('Invalid or expired Firebase token');
    }

    if (!firebaseUid || !email) {
      throw new UnauthorizedException('Firebase token is missing required claims');
    }

    (request as AuthenticatedRequest).authUser = { firebaseUid, email };

    return true;
  }

  private extractToken(authorizationHeader?: string): string {
    if (!authorizationHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing or invalid Authorization header');
    }
    return authorizationHeader.slice('Bearer '.length);
  }
}

export type AuthenticatedRequest = Request & {
  authUser: AuthenticatedUser;
};

export type AuthenticatedUser = {
  email: string;
  firebaseUid: string;
};
