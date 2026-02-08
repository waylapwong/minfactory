import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MinRpsGameController } from './controllers/minrps-game.controller';
import { MinRpsGateway } from './gateways/minrps.gateway';
import { MinRpsController } from './minrps.controller';
import { MinRpsGameEntity } from './models/entities/minrps-game.entity';
import { MinRpsGameRepository } from './repositories/minrps-game.repository';
import { MinRpsMatchRepository } from './repositories/minrps-match.repository';
import { MinRpsGameService } from './services/minrps-game.service';
import { MinRpsMatchSystem } from './systems/minrps-match.system';

@Module({
  imports: [TypeOrmModule.forFeature([MinRpsGameEntity])],
  controllers: [MinRpsController, MinRpsGameController],
  providers: [
    MinRpsGateway,
    MinRpsGameService,
    MinRpsGameRepository,
    MinRpsMatchSystem,
    MinRpsMatchRepository,
  ],
})
export class MinRpsModule {}
