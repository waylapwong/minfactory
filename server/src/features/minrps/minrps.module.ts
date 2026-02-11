import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MinRpsGameController } from './controllers/minrps-game.controller';
import { MinRpsSinglePlayerController } from './controllers/minrps-single-player.controller';
import { MinRpsGateway } from './gateways/minrps.gateway';
import { MinRpsController } from './minrps.controller';
import { MinRpsGameEntity } from './models/entities/minrps-game.entity';
import { MinRpsGameRepository } from './repositories/minrps-game.repository';
import { MinRpsMatchRepository } from './repositories/minrps-match.repository';
import { MinRpsGameService } from './services/minrps-game.service';
import { MinRpsMatchService } from './services/minrps-match.service';

@Module({
  imports: [TypeOrmModule.forFeature([MinRpsGameEntity])],
  controllers: [MinRpsController, MinRpsGameController, MinRpsSinglePlayerController],
  providers: [
    MinRpsGateway,
    MinRpsGameService,
    MinRpsGameRepository,
    MinRpsMatchService,
    MinRpsMatchRepository,
  ],
})
export class MinRpsModule {}
