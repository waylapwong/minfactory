import { Global, Module } from '@nestjs/common';
import { AuthenticationGuard } from './authentication.guard';
import { AuthenticationService } from './authentication.service';

@Global()
@Module({
  providers: [AuthenticationService, AuthenticationGuard],
  exports: [AuthenticationService, AuthenticationGuard],
})
export class AuthenticationModule {}
