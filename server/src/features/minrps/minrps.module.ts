import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { MinRPSController } from './controllers/minrps.controller';
import { MinRPSGateway } from './gateways/minrps.gateway';
import { MinRPSGameEntity } from './models/entities/minrps-game.entity';
import { MinRPSGameRepository } from './repositories/minrps-game.repository';
import { MinRPSGameService } from './services/minrps-game.service';

@Module({
  imports: [TypeOrmModule.forFeature([MinRPSGameEntity])],
  controllers: [MinRPSController],
  providers: [MinRPSGateway, MinRPSGameService, MinRPSGameRepository],
})
export class MinRPSModule {}
