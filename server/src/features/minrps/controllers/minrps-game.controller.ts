import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { MinRPSGameRequestDTO } from '../models/dtos/minrps-game-request';
import { MinRPSGameResponseDTO } from '../models/dtos/minrps-game-response.dto';
import { MinRPSGameService } from '../services/minrps-game.service';
import { API_200 } from 'src/shared/decorators/api-200.decorator';
import { API_201 } from 'src/shared/decorators/api-201.decorator';
import { API_204 } from 'src/shared/decorators/api-204.decorator';
import { API_400 } from 'src/shared/decorators/api-400.decorator';
import { API_500 } from 'src/shared/decorators/api-500.decorator';
import { API_Param_ID } from 'src/shared/decorators/param-id.decorator';
import { MinApp } from 'src/shared/enums/minapp.enum';

@Controller('minrps/games')
@ApiTags(MinApp.MinRPS)
export class MinRPSGameController {
  constructor(private readonly minRPSGameService: MinRPSGameService) {}

  @Delete(':id')
  @ApiOperation({ operationId: 'deleteMinRPSGame' })
  @API_Param_ID()
  @API_204()
  @API_400()
  @API_500()
  public async deleteMinRPSGame(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ): Promise<void> {
    await this.minRPSGameService.deleteMinRPSGame(id);
  }

  @Get()
  @ApiOperation({ operationId: 'getAllMinRPSGames' })
  @API_200({
    description: 'All minRPS games',
    isArray: true,
    type: MinRPSGameResponseDTO,
  })
  @API_500()
  public async getAllMinRPSGames(): Promise<MinRPSGameResponseDTO[]> {
    return await this.minRPSGameService.getAllMinRPSGames();
  }

  @Post()
  @ApiOperation({ operationId: 'createMinRPSGame' })
  @API_201({ description: 'Created', type: MinRPSGameResponseDTO })
  @API_400()
  @API_500()
  public async createMinRPSGame(@Body() dto: MinRPSGameRequestDTO): Promise<MinRPSGameResponseDTO> {
    return await this.minRPSGameService.createMinRPSGame(dto);
  }
}
