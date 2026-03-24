import * as admin from 'firebase-admin';
import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthenticationService {
  private readonly app: admin.app.App;

  constructor() {
    const projectId: string = this.getRequiredEnvironmentVariable('FIREBASE_PROJECT_ID');
    const clientEmail: string = this.getRequiredEnvironmentVariable('FIREBASE_CLIENT_EMAIL');
    const privateKey: string = this.getRequiredPrivateKey();

    this.app =
      admin.apps.length > 0
        ? admin.app()
        : admin.initializeApp({
            credential: admin.credential.cert({
              projectId,
              clientEmail,
              privateKey,
            }),
          });
  }

  public async verifyIdToken(token: string): Promise<admin.auth.DecodedIdToken> {
    return await this.app.auth().verifyIdToken(token);
  }

  private getRequiredEnvironmentVariable(name: string): string {
    const value: string | undefined = process.env[name]?.trim();
    if (!value) {
      throw new Error(`${name} is not configured`);
    }
    return value;
  }

  private getRequiredPrivateKey(): string {
    const escapedNewLine: string = String.raw`\n`;
    const privateKey: string | undefined = process.env.FIREBASE_PRIVATE_KEY?.replaceAll(escapedNewLine, '\n');
    if (!privateKey) {
      throw new Error('FIREBASE_PRIVATE_KEY is not configured');
    }
    return privateKey;
  }
}
