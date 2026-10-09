import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { RequestWithFirebaseUser } from '../models/request-with-firebase-user';
import { AuthenticationService } from '../services/authentication.service';
import { DecodedIdToken } from 'firebase-admin/auth';

@Injectable()
export class FirebaseGuard implements CanActivate {
  constructor(private readonly authenticationService: AuthenticationService) {}

  public async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest<Request>();
    const bearerToken: string = this.extractBearerToken(request.headers.authorization);

    let firebaseUid: string;
    let firebaseEmail: string;

    try {
      const decodedIdToken: DecodedIdToken = await this.authenticationService.verifyIdToken(bearerToken);
      firebaseUid = decodedIdToken.uid ?? '';
      firebaseEmail = decodedIdToken.email ?? '';
    } catch {
      throw new UnauthorizedException('Invalid or expired Firebase token');
    }

    if (!firebaseUid || !firebaseEmail) {
      throw new UnauthorizedException('Firebase token is missing required claims');
    }

    (request as RequestWithFirebaseUser).firebaseUser = { uid: firebaseUid, email: firebaseEmail };

    return true;
  }

  private extractBearerToken(authorizationHeader?: string): string {
    if (!authorizationHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing or invalid Authorization header');
    }
    return authorizationHeader.slice('Bearer '.length);
  }
}
