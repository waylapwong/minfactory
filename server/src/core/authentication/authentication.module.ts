import { Global, Module } from '@nestjs/common';
import { FirebaseGuard } from './guards/firebase.guard';
import { AuthenticationService } from './services/authentication.service';

@Global()
@Module({
  providers: [AuthenticationService, FirebaseGuard],
  exports: [AuthenticationService, FirebaseGuard],
})
export class AuthenticationModule {}
