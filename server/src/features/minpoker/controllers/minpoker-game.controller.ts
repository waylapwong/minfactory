import { Body, Controller, Get, HttpCode, Post, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { MinPokerCreateGameDto } from '../models/dtos/minpoker-create-game.dto';
import { MinPokerGameDto } from '../models/dtos/minpoker-game.dto';
import { MinPokerGameService } from '../services/minpoker-game.service';
import { AuthenticationGuard } from 'src/core/authentication/guards/authentication.guard';
import { API_200 } from 'src/shared/decorators/api-200.decorator';
import { API_201 } from 'src/shared/decorators/api-201.decorator';
import { API_400 } from 'src/shared/decorators/api-400.decorator';
import { API_401 } from 'src/shared/decorators/api-401.decorator';
import { API_500 } from 'src/shared/decorators/api-500.decorator';
import { MinApp } from 'src/shared/enums/minapp.enum';

@Controller('minpoker/games')
@ApiTags(MinApp.MinPoker)
export class MinPokerGameController {
  constructor(private readonly gameService: MinPokerGameService) {}

  @Get()
  @HttpCode(200)
  @UseGuards(AuthenticationGuard)
  @ApiOperation({ operationId: 'getAllMinPokerGames' })
  @API_200({ isArray: true, type: MinPokerGameDto })
  @API_401()
  @API_500()
  public async getAll(): Promise<MinPokerGameDto[]> {
    return await this.gameService.getAllGames();
  }

  @Post()
  @HttpCode(201)
  @UseGuards(AuthenticationGuard)
  @ApiOperation({ operationId: 'createMinPokerGame' })
  @API_201({ type: MinPokerGameDto })
  @API_400()
  @API_401()
  @API_500()
  public async create(@Body() dto: MinPokerCreateGameDto): Promise<MinPokerGameDto> {
    return await this.gameService.createGame(dto);
  }
}
