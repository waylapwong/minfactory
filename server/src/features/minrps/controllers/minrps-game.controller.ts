import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { MinRpsDomainMapper } from '../mapper/minrps-domain.mapper';
import { MinRpsDtoMapper } from '../mapper/minrps-dto.mapper';
import { MinRpsGame } from '../models/domains/minrps-game';
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
import { MinApp } from 'src/shared/enums/minapp.enum';

@Controller('minrps/games')
@ApiTags(MinApp.MinRpsGame)
export class MinRpsGameController {
  constructor(private readonly gameService: MinRpsGameService) {}

  @Delete(':id')
  @ApiOperation({ operationId: 'delete' })
  @API_Param_ID()
  @API_204()
  @API_400()
  @API_404()
  @API_500()
  public async delete(@Param('id', new ParseUUIDPipe()) id: string): Promise<void> {
    await this.gameService.deleteGame(id);
  }

  @Get(':id')
  @ApiOperation({ operationId: 'get' })
  @API_200({ type: MinRpsGameDto })
  @API_400()
  @API_404()
  @API_500()
  public async get(@Param('id', new ParseUUIDPipe()) id: string): Promise<MinRpsGameDto> {
    const domain: MinRpsGame = await this.gameService.getGame(id);
    return MinRpsDomainMapper.domainToDto(domain);
  }

  @Get()
  @ApiOperation({ operationId: 'getAll' })
  @API_200({ isArray: true, type: MinRpsGameDto })
  @API_500()
  public async getAll(): Promise<MinRpsGameDto[]> {
    const domains: MinRpsGame[] = await this.gameService.getAllGames();
    return domains.map((domain: MinRpsGame) => MinRpsDomainMapper.domainToDto(domain));
  }

  @Post()
  @ApiOperation({ operationId: 'create' })
  @API_201({ type: MinRpsGameDto })
  @API_400()
  @API_500()
  public async create(@Body() dto: MinRpsCreateGameDto): Promise<MinRpsGameDto> {
    const domain: MinRpsGame = MinRpsDtoMapper.createDtoToDomain(dto);
    const savedDomain: MinRpsGame = await this.gameService.createGame(domain);
    return MinRpsDomainMapper.domainToDto(savedDomain);
  }
}
