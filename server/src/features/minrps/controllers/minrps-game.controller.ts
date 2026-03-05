import { Body, Controller, Delete, Get, HttpCode, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { MinRpsCreateGameDto } from '../models/dtos/minrps-create-game.dto';
import { MinRpsGameDto } from '../models/dtos/minrps-game.dto';
import { MinRpsGameService } from '../services/minrps-game.service';
import { API_200 } from 'src/shared/decorators/api-200.decorator';
import { API_201 } from 'src/shared/decorators/api-201.decorator';
import { API_204 } from 'src/shared/decorators/api-204.decorator';
import { API_400 } from 'src/shared/decorators/api-400.decorator';
import { API_404 } from 'src/shared/decorators/api-404.decorator';
import { API_500 } from 'src/shared/decorators/api-500.decorator';
import { API_Param_ID } from 'src/shared/decorators/param-id.decorator';
import { AppName } from 'src/shared/enums/app-name.enum';

@Controller('minrps/games')
@ApiTags(AppName.MinRps)
export class MinRpsGameController {
  constructor(private readonly gameService: MinRpsGameService) {}

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ operationId: 'deleteMinRpsGame' })
  @API_Param_ID()
  @API_204()
  @API_400()
  @API_404()
  @API_500()
  public async delete(@Param('id', new ParseUUIDPipe()) id: string): Promise<void> {
    await this.gameService.deleteGame(id);
  }

  @Get(':id')
  @HttpCode(200)
  @ApiOperation({ operationId: 'getMinRpsGame' })
  @API_200({ type: MinRpsGameDto })
  @API_400()
  @API_404()
  @API_500()
  public async get(@Param('id', new ParseUUIDPipe()) id: string): Promise<MinRpsGameDto> {
    return await this.gameService.getGame(id);
  }

  @Get()
  @HttpCode(200)
  @ApiOperation({ operationId: 'getAllMinRpsGames' })
  @API_200({ isArray: true, type: MinRpsGameDto })
  @API_500()
  public async getAll(): Promise<MinRpsGameDto[]> {
    return await this.gameService.getAllGames();
  }

  @Post()
  @HttpCode(201)
  @ApiOperation({ operationId: 'createMinRpsGame' })
  @API_201({ type: MinRpsGameDto })
  @API_400()
  @API_500()
  public async create(@Body() dto: MinRpsCreateGameDto): Promise<MinRpsGameDto> {
    return await this.gameService.createGame(dto);
  }
}
