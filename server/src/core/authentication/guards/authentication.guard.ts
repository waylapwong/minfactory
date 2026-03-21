import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { AuthenticationService } from '../services/authentication.service';
import { AuthenticatedRequest } from '../models/authenticated-request';
import { DecodedIdToken } from 'firebase-admin/auth';

@Injectable()
export class AuthenticationGuard implements CanActivate {
  constructor(private readonly authenticationService: AuthenticationService) {}

  public async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest<Request>();
    const token: string = this.extractToken(request.headers.authorization);

    let firebaseUid: string;
    let email: string;

    try {
      const decodedToken: DecodedIdToken = await this.authenticationService.verifyIdToken(token);
      firebaseUid = decodedToken.uid;
      email = decodedToken.email ?? '';
    } catch {
      throw new UnauthorizedException('Invalid or expired Firebase token');
    }

    if (!firebaseUid || !email) {
      throw new UnauthorizedException('Firebase token is missing required claims');
    }

    (request as AuthenticatedRequest).firebaseUser = { firebaseUid, email };

    return true;
  }

  private extractToken(authorizationHeader?: string): string {
    if (!authorizationHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing or invalid Authorization header');
    }
    return authorizationHeader.slice('Bearer '.length);
  }
}
