import { Controller, Delete, Get, HttpCode, Post, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { MinFactoryUserDto } from '../models/dtos/minfactory-user.dto';
import { MinFactoryUserService } from '../services/minfactory-user.service';
import { FirebaseUser } from 'src/core/authentication/decorators/firebase-user.decorator';
import { AuthenticationGuard } from 'src/core/authentication/guards/authentication.guard';
import type { FirebaseUserDto } from 'src/core/authentication/models/firebase-user.dto';
import { API_200 } from 'src/shared/decorators/api-200.decorator';
import { API_201 } from 'src/shared/decorators/api-201.decorator';
import { API_204 } from 'src/shared/decorators/api-204.decorator';
import { API_401 } from 'src/shared/decorators/api-401.decorator';
import { API_404 } from 'src/shared/decorators/api-404.decorator';
import { API_409 } from 'src/shared/decorators/api-409.decorator';
import { API_500 } from 'src/shared/decorators/api-500.decorator';
import { MinApp } from 'src/shared/enums/minapp.enum';

@Controller('minfactory/users')
@ApiTags(MinApp.MinFactory)
export class MinFactoryUserController {
  constructor(private readonly userService: MinFactoryUserService) {}

  @Delete('me')
  @HttpCode(204)
  @UseGuards(AuthenticationGuard)
  @ApiOperation({ operationId: 'deleteMinFactoryUserMe' })
  @API_204()
  @API_401()
  @API_404()
  @API_500()
  public async deleteMe(@FirebaseUser() user: FirebaseUserDto): Promise<void> {
    return await this.userService.deleteMe(user);
  }

  @Get('me')
  @UseGuards(AuthenticationGuard)
  @ApiOperation({ operationId: 'getMinFactoryUserMe' })
  @API_200({ type: MinFactoryUserDto })
  @API_401()
  @API_404()
  @API_500()
  public async getMe(@FirebaseUser() user: FirebaseUserDto): Promise<MinFactoryUserDto> {
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
  public async create(@FirebaseUser() user: FirebaseUserDto): Promise<MinFactoryUserDto> {
    return await this.userService.createUser(user);
  }
}
