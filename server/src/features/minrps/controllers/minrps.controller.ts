import { Body, Controller, Post } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import { MinRPSGameRequestDTO } from '../models/dtos/minrps-game-request';
import { MinRPSGameResponseDTO } from '../models/dtos/minrps-game-response.dto';
import { MinRPSGameService } from '../services/minrps-game.service';
import { MinApp } from 'src/shared/enums/minapp.enum';

@Controller('minrps')
@ApiTags(MinApp.MinRPS)
export class MinRPSController {
  constructor(private readonly minRPSGameService: MinRPSGameService) {}

  @Post('games')
  @ApiOperation({ operationId: 'createMinRPSGame' })
  @ApiCreatedResponse({ description: 'Created', type: MinRPSGameResponseDTO })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiInternalServerErrorResponse({ description: 'Internal Server Error' })
  public async createMinRPSGame(@Body() dto: MinRPSGameRequestDTO): Promise<MinRPSGameResponseDTO> {
    return await this.minRPSGameService.createMinRPSGame(dto);
  }
}
