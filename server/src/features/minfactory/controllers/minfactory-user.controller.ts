import { Controller, Get, HttpCode, Post, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { MinFactoryUserDto } from '../models/dtos/minfactory-user.dto';
import { MinFactoryUserService } from '../services/minfactory-user.service';
import { User } from 'src/core/authentication/decorators/authenticated-user.decorator';
import { AuthenticationGuard } from 'src/core/authentication/guards/authentication.guard';
import type { FirebaseUserDto } from 'src/core/authentication/models/firebase-user.dto';
import { API_200 } from 'src/shared/decorators/api-200.decorator';
import { API_201 } from 'src/shared/decorators/api-201.decorator';
import { API_401 } from 'src/shared/decorators/api-401.decorator';
import { API_404 } from 'src/shared/decorators/api-404.decorator';
import { API_409 } from 'src/shared/decorators/api-409.decorator';
import { API_500 } from 'src/shared/decorators/api-500.decorator';
import { MinApp } from 'src/shared/enums/minapp.enum';

@Controller('minfactory/users')
@ApiTags(MinApp.MinFactory)
export class MinFactoryUserController {
  constructor(private readonly userService: MinFactoryUserService) {}

  @Get('me')
  @UseGuards(AuthenticationGuard)
  @ApiOperation({ operationId: 'getMinFactoryUserMe' })
  @API_200({ type: MinFactoryUserDto })
  @API_401()
  @API_404()
  @API_500()
  public async getMe(@User() user: FirebaseUserDto): Promise<MinFactoryUserDto> {
    return await this.userService.getMe(user);
  }

  @Post()
  @HttpCode(201)
  @UseGuards(AuthenticationGuard)
  @ApiOperation({ operationId: 'createMinFactoryUser' })
  @API_201({ type: MinFactoryUserDto })
  @API_401()
  @API_409()
  @API_500()
  public async create(@User() user: FirebaseUserDto): Promise<MinFactoryUserDto> {
    return await this.userService.createUser(user);
  }
}
