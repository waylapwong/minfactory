import { Module } from '@nestjs/common';
import { MinPokerModule } from './minpoker/minpoker.module';
import { MinRpsModule } from './minrps/minrps.module';
import { MinFactoryModule } from './minfactory/minfactory.module';
import { MinAdventModule } from './minadvent/minadvent.module';

@Module({
  imports: [MinPokerModule, MinRpsModule, MinFactoryModule, MinAdventModule],
  exports: [MinPokerModule, MinRpsModule, MinFactoryModule, MinAdventModule],
})
export class FeaturesModule {}
