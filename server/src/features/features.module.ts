import { Module } from '@nestjs/common';
import { MinRpsModule } from './minrps/minrps.module';
import { MinFactoryModule } from './minfactory/minfactory.module';

@Module({
  imports: [MinRpsModule, MinFactoryModule],
  exports: [MinRpsModule, MinFactoryModule],
})
export class FeaturesModule {}
