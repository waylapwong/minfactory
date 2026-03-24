import { Module } from '@nestjs/common';
import { MinPokerGameController } from './controllers/minpoker-game.controller';
import { MinPokerController } from './minpoker.controller';

@Module({
  controllers: [MinPokerController, MinPokerGameController],
  providers: [],
})
export class MinPokerModule {}
