import { Request } from 'express';
import { FirebaseIdentityDto } from './firebase-identity.dto';

export interface RequestWithIdentity extends Request {
  identity: FirebaseIdentityDto;
}
