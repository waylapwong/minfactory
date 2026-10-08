import { FirebaseIdentity } from './firebase-identity';
import { Request } from 'express';

export interface AuthenticatedRequest extends Request {
  firebaseIdentity: FirebaseIdentity;
}
