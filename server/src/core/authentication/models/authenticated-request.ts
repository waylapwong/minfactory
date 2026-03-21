import { FirebaseUserDto } from './firebase-user.dto';
import { Request } from 'express';

export interface AuthenticatedRequest extends Request {
  firebaseUser: FirebaseUserDto;
}
