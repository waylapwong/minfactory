import { Body, Controller, Delete, Get, HttpCode, Param, ParseUUIDPipe, Post, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { MinPokerCreateGameDto } from '../models/dtos/minpoker-create-game.dto';
import { MinPokerGameDto } from '../models/dtos/minpoker-game.dto';
import { MinPokerGameService } from '../services/minpoker-game.service';
import { FirebaseUser } from 'src/core/authentication/decorators/firebase-user.decorator';
import { AuthenticationGuard } from 'src/core/authentication/guards/authentication.guard';
import type { FirebaseUserDto } from 'src/core/authentication/models/firebase-user.dto';
import { API_200 } from 'src/shared/decorators/api-200.decorator';
import { API_201 } from 'src/shared/decorators/api-201.decorator';
import { API_204 } from 'src/shared/decorators/api-204.decorator';
import { API_400 } from 'src/shared/decorators/api-400.decorator';
import { API_401 } from 'src/shared/decorators/api-401.decorator';
import { API_403 } from 'src/shared/decorators/api-403.decorator';
import { API_404 } from 'src/shared/decorators/api-404.decorator';
import { API_500 } from 'src/shared/decorators/api-500.decorator';
import { API_Param_ID } from 'src/shared/decorators/api-param-id.decorator';
import { MinApp } from 'src/shared/enums/minapp.enum';

@Controller('minpoker/games')
@ApiTags(MinApp.MinPoker)
@UseGuards(AuthenticationGuard)
export class MinPokerGameController {
  constructor(private readonly gameService: MinPokerGameService) {}

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ operationId: 'deleteMinPokerGame' })
  @API_Param_ID()
  @API_204()
  @API_400()
  @API_401()
  @API_403()
  @API_404()
  @API_500()
  public async delete(
    @Param('id', new ParseUUIDPipe()) id: string,
    @FirebaseUser() firebaseUser: FirebaseUserDto,
  ): Promise<void> {
    await this.gameService.deleteGame(id, firebaseUser);
  }

  @Get()
  @HttpCode(200)
  @ApiOperation({ operationId: 'getAllMinPokerGames' })
  @API_200({ isArray: true, type: MinPokerGameDto })
  @API_401()
  @API_403()
  @API_404()
  @API_500()
  public async getAll(@FirebaseUser() firebaseUser: FirebaseUserDto): Promise<MinPokerGameDto[]> {
    return await this.gameService.getAllGames(firebaseUser);
  }

  @Post()
  @HttpCode(201)
  @ApiOperation({ operationId: 'createMinPokerGame' })
  @API_201({ type: MinPokerGameDto })
  @API_400()
  @API_401()
  @API_403()
  @API_404()
  @API_500()
  public async create(
    @Body() dto: MinPokerCreateGameDto,
    @FirebaseUser() firebaseUser: FirebaseUserDto,
  ): Promise<MinPokerGameDto> {
    return await this.gameService.createGame(dto, firebaseUser);
  }
}
