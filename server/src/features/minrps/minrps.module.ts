import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MinRpsGameController } from './controllers/minrps-game.controller';
import { MinRpsSingleplayerController } from './controllers/minrps-singleplayer.controller';
import { MinRpsGateway } from './gateways/minrps.gateway';
import { MinRpsController } from './minrps.controller';
import { MinRpsGameEntity } from './models/entities/minrps-game.entity';
import { MinRpsGameRepository } from './repositories/minrps-game.repository';
import { MinRpsMatchRepository } from './repositories/minrps-match.repository';
import { MinRpsGameSessionService } from './services/minrps-game-session.service';
import { MinRpsGameService } from './services/minrps-game.service';
import { MinRpsSingleplayerService } from './services/minrps-singleplayer.service';

@Module({
  imports: [TypeOrmModule.forFeature([MinRpsGameEntity])],
  controllers: [MinRpsController, MinRpsGameController, MinRpsSingleplayerController],
  providers: [
    MinRpsGateway,
    MinRpsGameService,
    MinRpsGameRepository,
    MinRpsGameSessionService,
    MinRpsMatchRepository,
    MinRpsSingleplayerService,
  ],
})
export class MinRpsModule {}
