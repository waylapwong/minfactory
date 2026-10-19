import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserRolePolicy } from '../../core/authorization/policies/user-role.policy';
import { MinFactoryUserGuard } from '../minfactory/guards/minfactory-user.guard';
import { MinFactoryModule } from '../minfactory/minfactory.module';
import { MinAdventCalendarController } from './controllers/minadvent-calendar.controller';
import { MinAdventCalendarEntity } from './models/entities/minadvent-calendar.entity';
import { MinAdventDoorEntity } from './models/entities/minadvent-door.entity';
import { MinAdventBlockEntity } from './models/entities/minadvent-block.entity';
import { MinAdventCalendarRepository } from './repositories/minadvent-calendar.repository';
import { MinAdventCalendarService } from './services/minadvent-calendar.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([MinAdventCalendarEntity, MinAdventDoorEntity, MinAdventBlockEntity]),
    MinFactoryModule,
  ],
  controllers: [MinAdventCalendarController],
  providers: [MinAdventCalendarRepository, MinAdventCalendarService, MinFactoryUserGuard, UserRolePolicy],
})
export class MinAdventModule {}
