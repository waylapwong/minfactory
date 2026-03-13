import { Module } from '@nestjs/common';
import { MinRpsModule } from './minrps/minrps.module';

@Module({
  imports: [MinRpsModule],
  exports: [MinRpsModule],
})
export class FeaturesModule {}
