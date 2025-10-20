import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { MinRPSGameController } from './controllers/minrps-game.controller';
import { MinRPSGateway } from './gateways/minrps.gateway';
import { MinRPSController } from './minrps.controller';
import { MinRPSGameEntity } from './models/entities/minrps-game.entity';
import { MinRPSGameRepository } from './repositories/minrps-game.repository';
import { MinRPSGameService } from './services/minrps-game.service';

@Module({
  imports: [TypeOrmModule.forFeature([MinRPSGameEntity])],
  controllers: [MinRPSController, MinRPSGameController],
  providers: [MinRPSGateway, MinRPSGameService, MinRPSGameRepository],
})
export class MinRPSModule {}
