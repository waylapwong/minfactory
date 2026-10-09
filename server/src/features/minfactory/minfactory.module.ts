import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MinFactoryUserController } from './controllers/minfactory-user.controller';
import { MinFactoryUserGuard } from './guards/minfactory-user.guard';
import { MinFactoryController } from './minfactory.controller';
import { MinFactoryUserEntity } from './models/entities/minfactory-user.entity';
import { MinFactoryRolePolicy } from './policies/minfactory-role.policy';
import { MinFactoryUserRepository } from './repositories/minfactory-user.repository';
import { MinFactoryUserService } from './services/minfactory-user.service';

@Module({
  imports: [TypeOrmModule.forFeature([MinFactoryUserEntity])],
  controllers: [MinFactoryController, MinFactoryUserController],
  providers: [MinFactoryUserService, MinFactoryUserRepository, MinFactoryUserGuard, MinFactoryRolePolicy],
  exports: [MinFactoryUserService],
})
export class MinFactoryModule {}
