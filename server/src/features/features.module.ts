import { Module } from '@nestjs/common';
import { MinPokerModule } from './minpoker/minpoker.module';
import { MinRpsModule } from './minrps/minrps.module';
import { MinFactoryModule } from './minfactory/minfactory.module';

@Module({
  imports: [MinPokerModule, MinRpsModule, MinFactoryModule],
  exports: [MinPokerModule, MinRpsModule, MinFactoryModule],
})
export class FeaturesModule {}
