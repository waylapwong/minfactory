import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserRolePolicy } from '../../core/authorization/policies/user-role.policy';
import { MinFactoryUserGuard } from '../minfactory/guards/minfactory-user.guard';
import { MinFactoryModule } from '../minfactory/minfactory.module';
import { MinAdventCalendarController } from './controllers/minadvent-calendar.controller';
import { MinAdventSharedController } from './controllers/minadvent-shared.controller';
import { MinAdventSharedThrottlerGuard } from './guards/minadvent-shared-throttler.guard';
import { MinAdventBlockEntity } from './models/entities/minadvent-block.entity';
import { MinAdventCalendarEntity } from './models/entities/minadvent-calendar.entity';
import { MinAdventDoorEntity } from './models/entities/minadvent-door.entity';
import { MinAdventCalendarRepository } from './repositories/minadvent-calendar.repository';
import { MinAdventCalendarService } from './services/minadvent-calendar.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([MinAdventCalendarEntity, MinAdventDoorEntity, MinAdventBlockEntity]),
    MinFactoryModule,
    ThrottlerModule.forRoot({ throttlers: [{ ttl: 60_000, limit: 60 }] }),
  ],
  controllers: [MinAdventCalendarController, MinAdventSharedController],
  providers: [
    MinAdventCalendarRepository,
    MinAdventCalendarService,
    MinAdventSharedThrottlerGuard,
    MinFactoryUserGuard,
    UserRolePolicy,
  ],
})
export class MinAdventModule {}
