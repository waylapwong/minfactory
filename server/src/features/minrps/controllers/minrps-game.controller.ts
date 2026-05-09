import { Body, Controller, Delete, Get, Headers, HttpCode, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { LoggerService } from '../../../core/logger/logger.service';
import { API_200 } from '../../../shared/decorators/api-200.decorator';
import { API_201 } from '../../../shared/decorators/api-201.decorator';
import { API_204 } from '../../../shared/decorators/api-204.decorator';
import { API_400 } from '../../../shared/decorators/api-400.decorator';
import { API_404 } from '../../../shared/decorators/api-404.decorator';
import { API_500 } from '../../../shared/decorators/api-500.decorator';
import { API_PARAM_ID } from '../../../shared/decorators/api-param-id.decorator';
import { API_HEADER_REQUEST_ID } from '../../../shared/decorators/api-request-id.decorator';
import { MinApp } from '../../../shared/enums/minapp.enum';
import { MinRpsCreateGameDto } from '../models/dtos/minrps-create-game.dto';
import { MinRpsGameDto } from '../models/dtos/minrps-game.dto';
import { MinRpsGameService } from '../services/minrps-game.service';

@Controller('minrps/games')
@ApiTags(MinApp.MinRps)
export class MinRpsGameController {
  private readonly logger: LoggerService = new LoggerService(MinRpsGameController.name);

  constructor(private readonly gameService: MinRpsGameService) {}

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ operationId: 'deleteMinRpsGame' })
  @API_HEADER_REQUEST_ID()
  @API_PARAM_ID()
  @API_204()
  @API_400()
  @API_404()
  @API_500()
  public async delete(@Param('id', new ParseUUIDPipe()) id: string, @Headers('X-Request-Id') requestId: string): Promise<void> {
    this.logger.log(`Incoming request DELETE /minrps/games/${id}`, requestId);
    await this.gameService.deleteGame(id);
  }

  @Get(':id')
  @HttpCode(200)
  @ApiOperation({ operationId: 'getMinRpsGame' })
  @API_HEADER_REQUEST_ID()
  @API_200({ type: MinRpsGameDto })
  @API_400()
  @API_404()
  @API_500()
  public async get(@Param('id', new ParseUUIDPipe()) id: string, @Headers('X-Request-Id') requestId: string): Promise<MinRpsGameDto> {
    this.logger.log(`Incoming request GET /minrps/games/${id}`, requestId);
    return await this.gameService.getGame(id);
  }

  @Get()
  @HttpCode(200)
  @ApiOperation({ operationId: 'getAllMinRpsGames' })
  @API_HEADER_REQUEST_ID()
  @API_200({ isArray: true, type: MinRpsGameDto })
  @API_500()
  public async getAll(@Headers('X-Request-Id') requestId: string): Promise<MinRpsGameDto[]> {
    this.logger.log(`Incoming request GET /minrps/games`, requestId);
    return await this.gameService.getAllGames();
  }

  @Post()
  @HttpCode(201)
  @ApiOperation({ operationId: 'createMinRpsGame' })
  @API_HEADER_REQUEST_ID()
  @API_201({ type: MinRpsGameDto })
  @API_400()
  @API_500()
  public async create(@Body() dto: MinRpsCreateGameDto, @Headers('X-Request-Id') requestId: string): Promise<MinRpsGameDto> {
    this.logger.log(`Incoming request POST /minrps/games`, requestId);
    return await this.gameService.createGame(dto);
  }
}
