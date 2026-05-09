import { Controller, Delete, Get, Headers, HttpCode, Post, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { FirebaseUser } from '../../../core/authentication/decorators/firebase-user.decorator';
import { AuthenticationGuard } from '../../../core/authentication/guards/authentication.guard';
import type { FirebaseUserDto } from '../../../core/authentication/models/firebase-user.dto';
import { LoggerService } from '../../../core/logging/services/logger.service';
import { API_200 } from '../../../shared/decorators/api-200.decorator';
import { API_201 } from '../../../shared/decorators/api-201.decorator';
import { API_204 } from '../../../shared/decorators/api-204.decorator';
import { API_401 } from '../../../shared/decorators/api-401.decorator';
import { API_404 } from '../../../shared/decorators/api-404.decorator';
import { API_409 } from '../../../shared/decorators/api-409.decorator';
import { API_500 } from '../../../shared/decorators/api-500.decorator';
import { API_HEADER_REQUEST_ID } from '../../../shared/decorators/api-request-id.decorator';
import { MinApp } from '../../../shared/enums/minapp.enum';
import { MinFactoryUserDto } from '../models/dtos/minfactory-user.dto';
import { MinFactoryUserService } from '../services/minfactory-user.service';

@Controller('minfactory/users')
@ApiTags(MinApp.MinFactory)
export class MinFactoryUserController {
  private readonly logger: LoggerService = new LoggerService(MinFactoryUserController.name);

  constructor(private readonly userService: MinFactoryUserService) {}

  @Delete('me')
  @HttpCode(204)
  @UseGuards(AuthenticationGuard)
  @ApiOperation({ operationId: 'deleteMinFactoryUserMe' })
  @API_HEADER_REQUEST_ID()
  @API_204()
  @API_401()
  @API_404()
  @API_500()
  public async deleteMe(@FirebaseUser() user: FirebaseUserDto, @Headers('X-Request-Id') requestId: string): Promise<void> {
    this.logger.log(`Incoming request DELETE /minfactory/users/me`, requestId);
    return await this.userService.deleteMe(user);
  }

  @Get('me')
  @UseGuards(AuthenticationGuard)
  @ApiOperation({ operationId: 'getMinFactoryUserMe' })
  @API_HEADER_REQUEST_ID()
  @API_200({ type: MinFactoryUserDto })
  @API_401()
  @API_404()
  @API_500()
  public async getMe(@FirebaseUser() user: FirebaseUserDto, @Headers('X-Request-Id') requestId: string): Promise<MinFactoryUserDto> {
    this.logger.log(`Incoming request GET /minfactory/users/me`, requestId);
    return await this.userService.getMe(user);
  }

  @Post()
  @HttpCode(201)
  @UseGuards(AuthenticationGuard)
  @ApiOperation({ operationId: 'createMinFactoryUser' })
  @API_HEADER_REQUEST_ID()
  @API_201({ type: MinFactoryUserDto })
  @API_401()
  @API_409()
  @API_500()
  public async create(@FirebaseUser() user: FirebaseUserDto, @Headers('X-Request-Id') requestId: string): Promise<MinFactoryUserDto> {
    this.logger.log(`Incoming request POST /minfactory/users`, requestId);
    return await this.userService.createUser(user);
  }
}
