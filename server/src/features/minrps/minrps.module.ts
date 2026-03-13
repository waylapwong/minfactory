import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MinRpsGameController } from './controllers/minrps-game.controller';
import { MinRpsSingleplayerController } from './controllers/minrps-singleplayer.controller';
import { MinRpsGateway } from './gateways/minrps.gateway';
import { MinRpsController } from './minrps.controller';
import { MinRpsGameEntity } from './models/entities/minrps-game.entity';
import { MinRpsGameRepository } from './repositories/minrps-game.repository';
import { MinRpsMatchRepository } from './repositories/minrps-match.repository';
import { MinRpsPlayerIdRepository } from './repositories/minrps-player-id.repository';
import { MinRpsGameService } from './services/minrps-game.service';
import { MinRpsMultiplayerService } from './services/minrps-multiplayer.service';
import { MinRpsSingleplayerService } from './services/minrps-singleplayer.service';
import { MinRpsRoomSystem } from './systems/minrps-room.system';

@Module({
  imports: [TypeOrmModule.forFeature([MinRpsGameEntity])],
  controllers: [MinRpsController, MinRpsGameController, MinRpsSingleplayerController],
  providers: [
    MinRpsGateway,
    MinRpsGameService,
    MinRpsMultiplayerService,
    MinRpsSingleplayerService,
    MinRpsRoomSystem,
    MinRpsGameRepository,
    MinRpsMatchRepository,
    MinRpsPlayerIdRepository,
  ],
})
export class MinRpsModule {}
