import { Request } from 'express';
import { FirebaseUserDto } from './firebase-user.dto';

export interface RequestWithFirebaseUser extends Request {
  firebaseUser: FirebaseUserDto;
}
