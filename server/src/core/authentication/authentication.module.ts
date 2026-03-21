import { Global, Module } from '@nestjs/common';
import { AuthenticationGuard } from './guards/authentication.guard';
import { AuthenticationService } from './services/authentication.service';

@Global()
@Module({
  providers: [AuthenticationService, AuthenticationGuard],
  exports: [AuthenticationService, AuthenticationGuard],
})
export class AuthenticationModule {}
