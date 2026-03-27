import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MinPokerGameController } from './controllers/minpoker-game.controller';
import { MinPokerGateway } from './gateways/minpoker.gateway';
import { MinPokerController } from './minpoker.controller';
import { MinPokerGameEntity } from './models/entities/minpoker-game.entity';
import { MinPokerGameRepository } from './repositories/minpoker-game.repository';
import { MinPokerGameService } from './services/minpoker-game.service';
import { MinPokerTournamentService } from './services/minpoker-tournament.service';
import { MinFactoryModule } from 'src/features/minfactory/minfactory.module';

@Module({
  imports: [TypeOrmModule.forFeature([MinPokerGameEntity]), MinFactoryModule],
  controllers: [MinPokerController, MinPokerGameController],
  providers: [MinPokerGameService, MinPokerGameRepository, MinPokerTournamentService, MinPokerGateway],
})
export class MinPokerModule {}
