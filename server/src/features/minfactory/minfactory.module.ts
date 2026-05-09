import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RolesGuard } from '../../core/authorization/guards/roles.guard';
import { MinFactoryUserController } from './controllers/minfactory-user.controller';
import { MinFactoryController } from './minfactory.controller';
import { MinFactoryUserEntity } from './models/entities/minfactory-user.entity';
import { MinFactoryUserRepository } from './repositories/minfactory-user.repository';
import { MinFactoryUserService } from './services/minfactory-user.service';

@Module({
  imports: [TypeOrmModule.forFeature([MinFactoryUserEntity])],
  controllers: [MinFactoryController, MinFactoryUserController],
  providers: [MinFactoryUserService, MinFactoryUserRepository, RolesGuard],
  exports: [MinFactoryUserRepository, RolesGuard],
})
export class MinFactoryModule {}
