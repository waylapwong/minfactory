import { Module } from '@nestjs/common';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { FeaturesModule } from './features/features.module';
import { MinRPSGateway } from './features/minrps/gateways/minrps.gateway';

@Module({
  imports: [FeaturesModule],
  controllers: [AppController],
  providers: [MinRPSGateway, AppService]
})
export class AppModule {}
