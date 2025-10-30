import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { MinRpsGameController } from './controllers/minrps-game.controller';
import { MinRPSGateway } from './gateways/minrps.gateway';
import { MinRPSController } from './minrps.controller';
import { MinRpsGameEntity } from './models/entities/minrps-game.entity';
import { MinRPSGameRepository } from './repositories/minrps-game.repository';
import { MinRpsGameService } from './services/minrps-game.service';

@Module({
  imports: [TypeOrmModule.forFeature([MinRpsGameEntity])],
  controllers: [MinRPSController, MinRpsGameController],
  providers: [MinRPSGateway, MinRpsGameService, MinRPSGameRepository],
})
export class MinRPSModule {}
