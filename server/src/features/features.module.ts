import { Module } from '@nestjs/common';

import { MinRPSModule } from './minrps/minrps.module';

@Module({
  imports: [MinRPSModule],
  exports: [MinRPSModule]
})
export class FeaturesModule {}
