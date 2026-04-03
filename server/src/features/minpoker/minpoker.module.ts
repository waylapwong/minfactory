import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MinPokerGameController } from './controllers/minpoker-game.controller';
import { MinPokerGateway } from './gateways/minpoker.gateway';
import { MinPokerController } from './minpoker.controller';
import { MinPokerGameEntity } from './models/entities/minpoker-game.entity';
import { MinPokerDeckRepository } from './repositories/minpoker-deck.repository';
import { MinPokerGameRepository } from './repositories/minpoker-game.repository';
import { MinPokerMatchRepository } from './repositories/minpoker-match.repository';
import { MinPokerPlayerIdRepository } from './repositories/minpoker-player-id.repository';
import { MinPokerGameService } from './services/minpoker-game.service';
import { MinPokerTournamentService } from './services/minpoker-tournament.service';
import { MinPokerRoomSystem } from './systems/minpoker-room.system';
import { MinFactoryModule } from 'src/features/minfactory/minfactory.module';

@Module({
  imports: [TypeOrmModule.forFeature([MinPokerGameEntity]), MinFactoryModule],
  controllers: [MinPokerController, MinPokerGameController],
  providers: [
    MinPokerDeckRepository,
    MinPokerGameService,
    MinPokerGameRepository,
    MinPokerMatchRepository,
    MinPokerPlayerIdRepository,
    MinPokerRoomSystem,
    MinPokerTournamentService,
    MinPokerGateway,
  ],
})
export class MinPokerModule {}
