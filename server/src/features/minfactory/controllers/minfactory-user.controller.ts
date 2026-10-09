import { AuthorizationGuard, Can } from '@nestjs/authorization';
import { Controller, Delete, Get, Headers, HttpCode, Post, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { User } from '../../../core/authentication/decorators/user.decorator';
import { FirebaseGuard } from '../../../core/authentication/guards/firebase.guard';
import { LoggerService } from '../../../core/logging/services/logger.service';
import { API_200 } from '../../../shared/decorators/api-200.decorator';
import { API_201 } from '../../../shared/decorators/api-201.decorator';
import { API_204 } from '../../../shared/decorators/api-204.decorator';
import { API_400 } from '../../../shared/decorators/api-400.decorator';
import { API_401 } from '../../../shared/decorators/api-401.decorator';
import { API_404 } from '../../../shared/decorators/api-404.decorator';
import { API_409 } from '../../../shared/decorators/api-409.decorator';
import { API_500 } from '../../../shared/decorators/api-500.decorator';
import { API_HEADER_REQUEST_ID } from '../../../shared/decorators/api-request-id.decorator';
import { MinApp } from '../../../shared/enums/minapp.enum';
import { AllowUnregisteredUser } from '../decorators/allow-unregistered-user.decorator';
import { MinFactoryUserGuard } from '../guards/minfactory-user.guard';
import { MinFactoryUser } from '../models/domains/minfactory-user';
import { MinFactoryUserDto } from '../models/dtos/minfactory-user.dto';
import { MinFactoryRolePolicy } from '../policies/minfactory-role.policy';
import { MinFactoryUserService } from '../services/minfactory-user.service';

@Controller('minfactory/users')
@ApiTags(MinApp.MinFactory)
// ! Order of Guards is very important: FirebaseGuard -> MinFactoryUserGuard -> AuthorizationGuard
@UseGuards(FirebaseGuard, MinFactoryUserGuard, AuthorizationGuard)
@Can(MinFactoryRolePolicy, 'user')
export class MinFactoryUserController {
  private readonly logger: LoggerService = new LoggerService(MinFactoryUserController.name);

  constructor(private readonly userService: MinFactoryUserService) {}

  @Delete('me')
  @HttpCode(204)
  @ApiOperation({ operationId: 'deleteMinFactoryUserMe' })
  @API_HEADER_REQUEST_ID()
  @API_204()
  @API_400()
  @API_401()
  @API_404()
  @API_500()
  public async deleteMe(@User() user: MinFactoryUser, @Headers('X-Request-Id') requestId: string): Promise<void> {
    this.logger.debug(`Incoming request DELETE /minfactory/users/me`, requestId);
    return await this.userService.deleteMe(user, requestId);
  }

  @Get('me')
  @ApiOperation({ operationId: 'getMinFactoryUserMe' })
  @API_HEADER_REQUEST_ID()
  @API_200({ type: MinFactoryUserDto })
  @API_400()
  @API_401()
  @API_404()
  @API_500()
  public getMe(@User() user: MinFactoryUser, @Headers('X-Request-Id') requestId: string): MinFactoryUserDto {
    this.logger.debug(`Incoming request GET /minfactory/users/me`, requestId);
    return this.userService.getMe(user);
  }

  @Post()
  @HttpCode(201)
  @ApiOperation({ operationId: 'createMinFactoryUser' })
  @AllowUnregisteredUser()
  @API_HEADER_REQUEST_ID()
  @API_201({ type: MinFactoryUserDto })
  @API_400()
  @API_401()
  @API_409()
  @API_500()
  public async create(@User() user: MinFactoryUser, @Headers('X-Request-Id') requestId: string): Promise<MinFactoryUserDto> {
    this.logger.debug(`Incoming request POST /minfactory/users`, requestId);
    return await this.userService.createUser(user, requestId);
  }
}
