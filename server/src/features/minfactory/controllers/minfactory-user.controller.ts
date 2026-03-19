import { Controller, Get, HttpCode, Post, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { MinFactoryUserDto } from '../models/dtos/minfactory-user.dto';
import { MinFactoryUserService } from '../services/minfactory-user.service';
import { AuthenticationGuard } from 'src/core/authentication/authentication.guard';
import type { AuthenticatedUser } from 'src/core/authentication/authentication.guard';
import { User } from 'src/core/authentication/decorators/authenticated-user.decorator';
import { API_200 } from 'src/shared/decorators/api-200.decorator';
import { API_201 } from 'src/shared/decorators/api-201.decorator';
import { API_401 } from 'src/shared/decorators/api-401.decorator';
import { API_404 } from 'src/shared/decorators/api-404.decorator';
import { API_409 } from 'src/shared/decorators/api-409.decorator';
import { API_500 } from 'src/shared/decorators/api-500.decorator';
import { AppName } from 'src/shared/enums/app-name.enum';
@Controller('minfactory/users')
@ApiTags(AppName.MinFactory)
export class MinFactoryUserController {
  constructor(private readonly userService: MinFactoryUserService) {}

  @Post()
  @HttpCode(201)
  @UseGuards(AuthenticationGuard)
  @ApiOperation({ operationId: 'createMinFactoryUser' })
  @API_201({ type: MinFactoryUserDto })
  @API_401()
  @API_409()
  @API_500()
  public async create(@User() user: AuthenticatedUser): Promise<MinFactoryUserDto> {
    return await this.userService.createUser(user.firebaseUid, user.email);
  }

  @Get('me')
  @UseGuards(AuthenticationGuard)
  @ApiOperation({ operationId: 'getMinFactoryUserMe' })
  @API_200({ type: MinFactoryUserDto })
  @API_401()
  @API_404()
  @API_500()
  public async getMe(@User() user: AuthenticatedUser): Promise<MinFactoryUserDto> {
    return await this.userService.getMe(user.firebaseUid);
  }
}
