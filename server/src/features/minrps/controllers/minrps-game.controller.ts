import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';

import { MinRPSGameRequestDTO } from '../models/dtos/minrps-game-request';
import { MinRPSGameResponseDTO } from '../models/dtos/minrps-game-response.dto';
import { MinRPSGameService } from '../services/minrps-game.service';
import { MinApp } from 'src/shared/enums/minapp.enum';

@Controller('minrps/games')
@ApiTags(MinApp.MinRPS)
export class MinRPSGameController {
  constructor(private readonly minRPSGameService: MinRPSGameService) {}

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ operationId: 'deleteMinRPSGame' })
  @ApiParam({
    name: 'id',
    description: 'UUID of the game to delete',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiNoContentResponse({ description: 'Deleted' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiInternalServerErrorResponse({ description: 'Internal Server Error' })
  public async deleteMinRPSGame(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ): Promise<void> {
    await this.minRPSGameService.deleteMinRPSGame(id);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ operationId: 'getAllMinRPSGames' })
  @ApiOkResponse({
    description: 'All minRPS games',
    isArray: true,
    type: MinRPSGameResponseDTO,
  })
  @ApiInternalServerErrorResponse({ description: 'Internal Server Error' })
  public async getAllMinRPSGames(): Promise<MinRPSGameResponseDTO[]> {
    return await this.minRPSGameService.getAllMinRPSGames();
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ operationId: 'createMinRPSGame' })
  @ApiCreatedResponse({ description: 'Created', type: MinRPSGameResponseDTO })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiInternalServerErrorResponse({ description: 'Internal Server Error' })
  public async createMinRPSGame(@Body() dto: MinRPSGameRequestDTO): Promise<MinRPSGameResponseDTO> {
    return await this.minRPSGameService.createMinRPSGame(dto);
  }
}
