import { Module } from '@nestjs/common';
import { MinPokerController } from './minpoker.controller';

@Module({
  controllers: [MinPokerController],
  providers: [],
})
export class MinPokerModule {}
