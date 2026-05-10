import { Body, Controller, Delete, Get, Headers, HttpCode, Param, ParseUUIDPipe, Post, Query, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { FirebaseUser } from '../../../core/authentication/decorators/firebase-user.decorator';
import { AuthenticationGuard } from '../../../core/authentication/guards/authentication.guard';
import type { FirebaseUserDto } from '../../../core/authentication/models/firebase-user.dto';
import { LoggerService } from '../../../core/logging/services/logger.service';
import { API_200 } from '../../../shared/decorators/api-200.decorator';
import { API_201 } from '../../../shared/decorators/api-201.decorator';
import { API_204 } from '../../../shared/decorators/api-204.decorator';
import { API_400 } from '../../../shared/decorators/api-400.decorator';
import { API_401 } from '../../../shared/decorators/api-401.decorator';
import { API_403 } from '../../../shared/decorators/api-403.decorator';
import { API_404 } from '../../../shared/decorators/api-404.decorator';
import { API_500 } from '../../../shared/decorators/api-500.decorator';
import { API_PARAM_ID } from '../../../shared/decorators/api-param-id.decorator';
import { API_HEADER_REQUEST_ID } from '../../../shared/decorators/api-request-id.decorator';
import { MinApp } from '../../../shared/enums/minapp.enum';
import { MinPokerCreateGameDto } from '../models/dtos/minpoker-create-game.dto';
import { MinPokerGameDto } from '../models/dtos/minpoker-game.dto';
import { MinPokerGameVisibility } from '../models/enums/minpoker-game-visibility.enum';
import { MinPokerGameService } from '../services/minpoker-game.service';

@Controller('minpoker/games')
@ApiTags(MinApp.MinPoker)
@UseGuards(AuthenticationGuard)
export class MinPokerGameController {
  private readonly logger: LoggerService = new LoggerService(MinPokerGameController.name);

  constructor(private readonly gameService: MinPokerGameService) {}

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ operationId: 'deleteMinPokerGame' })
  @API_HEADER_REQUEST_ID()
  @API_PARAM_ID()
  @API_204()
  @API_400()
  @API_401()
  @API_403()
  @API_404()
  @API_500()
  public async delete(
    @Param('id', new ParseUUIDPipe()) id: string,
    @FirebaseUser() firebaseUser: FirebaseUserDto,
    @Headers('X-Request-Id') requestId: string,
  ): Promise<void> {
    this.logger.debug(`START delete(id: ${id}, firebaseUser: ${firebaseUser.uid})`, requestId);
    await this.gameService.deleteGame(id, firebaseUser, requestId);
    this.logger.debug(`END delete(...)`, requestId);
  }

  @Get()
  @HttpCode(200)
  @ApiOperation({ operationId: 'getAllMinPokerGames' })
  @ApiQuery({
    description: 'public = alle öffentlichen Spiele. Ohne Parameter = eigene Spiele.',
    enum: MinPokerGameVisibility,
    example: MinPokerGameVisibility.Public,
    name: 'visibility',
    required: true,
  })
  @API_HEADER_REQUEST_ID()
  @API_200({ isArray: true, type: MinPokerGameDto })
  @API_401()
  @API_403()
  @API_404()
  @API_500()
  public async getAll(
    @FirebaseUser() firebaseUser: FirebaseUserDto,
    @Headers('X-Request-Id') requestId: string,
    @Query('visibility') visibility: MinPokerGameVisibility,
  ): Promise<MinPokerGameDto[]> {
    this.logger.debug(`START getAll(firebaseUser: ${firebaseUser.uid}, visibility: ${visibility})`, requestId);
    const response: MinPokerGameDto[] = await this.gameService.getAllGames(firebaseUser, visibility, requestId);
    this.logger.debug(`END getAll(...)`, requestId);
    return response;
  }

  @Post()
  @HttpCode(201)
  @ApiOperation({ operationId: 'createMinPokerGame' })
  @API_HEADER_REQUEST_ID()
  @API_201({ type: MinPokerGameDto })
  @API_400()
  @API_401()
  @API_403()
  @API_404()
  @API_500()
  public async create(
    @Body() dto: MinPokerCreateGameDto,
    @FirebaseUser() firebaseUser: FirebaseUserDto,
    @Headers('X-Request-Id') requestId: string,
  ): Promise<MinPokerGameDto> {
    this.logger.debug(`START create(dto: ${JSON.stringify(dto)}, firebaseUser: ${firebaseUser.uid})`, requestId);
    const response: MinPokerGameDto = await this.gameService.createGame(dto, firebaseUser, requestId);
    this.logger.debug(`END create(...)`, requestId);
    return response;
  }
}
