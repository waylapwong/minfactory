import { Module } from '@nestjs/common';

import { MinRPSController } from './controllers/minrps/minrps.controller';
import { MinRPSGateway } from './gateways/minrps.gateway';

@Module({
  imports: [],
  controllers: [MinRPSController],
  providers: [MinRPSGateway],
  exports: [MinRPSGateway],
})
export class MinRPSModule {}
