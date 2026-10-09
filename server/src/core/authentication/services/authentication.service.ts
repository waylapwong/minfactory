import * as firebase from 'firebase-admin';
import { Injectable } from '@nestjs/common';
import { DecodedIdToken } from 'firebase-admin/auth';

@Injectable()
export class AuthenticationService {
  private readonly firebaseApp: firebase.app.App;

  constructor() {
    const projectId: string = this.getRequiredEnvironmentVariable('FIREBASE_PROJECT_ID');
    const clientEmail: string = this.getRequiredEnvironmentVariable('FIREBASE_CLIENT_EMAIL');
    const privateKey: string = this.getRequiredPrivateKey();

    this.firebaseApp =
      firebase.apps.length > 0
        ? firebase.app()
        : firebase.initializeApp({
            credential: firebase.credential.cert({
              projectId,
              clientEmail,
              privateKey,
            }),
          });
  }

  public async deleteUser(uid: string): Promise<void> {
    await this.firebaseApp.auth().deleteUser(uid);
  }

  public async verifyIdToken(firebaseIdToken: string): Promise<DecodedIdToken> {
    return await this.firebaseApp.auth().verifyIdToken(firebaseIdToken);
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
