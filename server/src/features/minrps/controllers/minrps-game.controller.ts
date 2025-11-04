import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { MinRpsGameRequestDto } from '../models/dtos/minrps-game-request';
import { MinRpsGameResponseDto } from '../models/dtos/minrps-game-response.dto';
import { MinRpsGameService } from '../services/minrps-game.service';
import { API_200 } from 'src/shared/decorators/api-200.decorator';
import { API_201 } from 'src/shared/decorators/api-201.decorator';
import { API_204 } from 'src/shared/decorators/api-204.decorator';
import { API_400 } from 'src/shared/decorators/api-400.decorator';
import { API_404 } from 'src/shared/decorators/api-404.decorator';
import { API_500 } from 'src/shared/decorators/api-500.decorator';
import { API_Param_ID } from 'src/shared/decorators/param-id.decorator';
import { MinApp } from 'src/shared/enums/minapp.enum';

@ApiTags(MinApp.MinRpsGame)
@Controller('minrps/games')
export class MinRpsGameController {
  constructor(private readonly gameService: MinRpsGameService) {}

  @ApiOperation({ operationId: 'getGame' })
  @API_200({ type: MinRpsGameResponseDto })
  @API_400()
  @API_404()
  @API_500()
  @Get(':id')
  public async getGame(@Param('id') id: string): Promise<MinRpsGameResponseDto> {
    return await this.gameService.getGame(id);
  }

  @ApiOperation({ operationId: 'getAllGames' })
  @API_200({ isArray: true, type: MinRpsGameResponseDto })
  @API_500()
  @Get()
  public async getAllGames(): Promise<MinRpsGameResponseDto[]> {
    return await this.gameService.getAllGames();
  }

  @ApiOperation({ operationId: 'createGame' })
  @API_201({ type: MinRpsGameResponseDto })
  @API_400()
  @API_500()
  @Post()
  public async createGame(@Body() dto: MinRpsGameRequestDto): Promise<MinRpsGameResponseDto> {
    return await this.gameService.createGame(dto);
  }

  @ApiOperation({ operationId: 'deleteGame' })
  @API_Param_ID()
  @API_204()
  @API_400()
  @API_404()
  @API_500()
  @Delete(':id')
  public async deleteGame(@Param('id', new ParseUUIDPipe()) id: string): Promise<void> {
    await this.gameService.deleteGame(id);
  }
}
