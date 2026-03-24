import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MinPokerGameController } from './controllers/minpoker-game.controller';
import { MinPokerController } from './minpoker.controller';
import { MinPokerGameEntity } from './models/entities/minpoker-game.entity';
import { MinPokerGameRepository } from './repositories/minpoker-game.repository';
import { MinPokerGameService } from './services/minpoker-game.service';

@Module({
  imports: [TypeOrmModule.forFeature([MinPokerGameEntity])],
  controllers: [MinPokerController, MinPokerGameController],
  providers: [MinPokerGameService, MinPokerGameRepository],
})
export class MinPokerModule {}
