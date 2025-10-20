import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import { ApiInternalServerErrorResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

import { MinRPSGameRequestDTO } from '../models/dtos/minrps-game-request';
import { MinRPSGameResponseDTO } from '../models/dtos/minrps-game-response.dto';
import { MinRPSGameService } from '../services/minrps-game.service';
import { BadRequest } from 'src/shared/decorators/bad-request.decorator';
import { Created } from 'src/shared/decorators/created.decorator';
import { ID } from 'src/shared/decorators/id.decorator';
import { InternalServerError } from 'src/shared/decorators/internal-server-error.decorator';
import { NoContent } from 'src/shared/decorators/no-content.decorator';
import { OK } from 'src/shared/decorators/ok.decorator';
import { MinApp } from 'src/shared/enums/minapp.enum';

@Controller('minrps/games')
@ApiTags(MinApp.MinRPS)
export class MinRPSGameController {
  constructor(private readonly minRPSGameService: MinRPSGameService) {}

  @Delete(':id')
  @ApiOperation({ operationId: 'deleteMinRPSGame' })
  @ID()
  @NoContent()
  @BadRequest()
  @InternalServerError()
  public async deleteMinRPSGame(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ): Promise<void> {
    await this.minRPSGameService.deleteMinRPSGame(id);
  }

  @Get()
  @ApiOperation({ operationId: 'getAllMinRPSGames' })
  @OK({
    description: 'All minRPS games',
    isArray: true,
    type: MinRPSGameResponseDTO,
  })
  @ApiInternalServerErrorResponse({ description: 'Internal Server Error' })
  public async getAllMinRPSGames(): Promise<MinRPSGameResponseDTO[]> {
    return await this.minRPSGameService.getAllMinRPSGames();
  }

  @Post()
  @ApiOperation({ operationId: 'createMinRPSGame' })
  @Created({ description: 'Created', type: MinRPSGameResponseDTO })
  @BadRequest()
  @InternalServerError()
  public async createMinRPSGame(@Body() dto: MinRPSGameRequestDTO): Promise<MinRPSGameResponseDTO> {
    return await this.minRPSGameService.createMinRPSGame(dto);
  }
}
