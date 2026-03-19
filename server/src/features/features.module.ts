import { Module } from '@nestjs/common';
import { MinRpsModule } from './minrps/minrps.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [MinRpsModule, UserModule],
  exports: [MinRpsModule, UserModule],
})
export class FeaturesModule {}
