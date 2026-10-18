import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { RequestWithIdentity } from '../models/request-with-identity';
import { AuthenticationService } from '../services/authentication.service';
import { DecodedIdToken } from 'firebase-admin/auth';

@Injectable()
export class FirebaseGuard implements CanActivate {
  constructor(private readonly authenticationService: AuthenticationService) {}

  public async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest<Request>();
    const bearerToken: string = this.extractBearerToken(request.headers.authorization);
    let decodedIdToken: DecodedIdToken | null = null;

    try {
      decodedIdToken = await this.authenticationService.verifyIdToken(bearerToken);
    } catch {
      throw new UnauthorizedException('Invalid or expired Firebase token');
    }

    if (!decodedIdToken.uid || !decodedIdToken.email) {
      throw new UnauthorizedException('Missing identity token claims');
    }

    (request as RequestWithIdentity).identity = { uid: decodedIdToken.uid, email: decodedIdToken.email ?? '' };

    return true;
  }

  private extractBearerToken(authorizationHeader?: string): string {
    if (!authorizationHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing or invalid Authorization header');
    }
    return authorizationHeader.slice('Bearer '.length);
  }
}
