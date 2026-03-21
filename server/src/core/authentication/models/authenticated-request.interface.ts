import { FirebaseUser } from './firebase-user.interface';
import { Request } from 'express';

export interface AuthenticatedRequest extends Request {
  firebaseUser: FirebaseUser;
}
