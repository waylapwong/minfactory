import { Controller, Get, HttpCode, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthenticationGuard } from 'src/core/authentication/guards/authentication.guard';
import { API_200 } from 'src/shared/decorators/api-200.decorator';
import { API_401 } from 'src/shared/decorators/api-401.decorator';
import { API_500 } from 'src/shared/decorators/api-500.decorator';
import { MinApp } from 'src/shared/enums/minapp.enum';
import { MinPokerGameDto } from '../models/dtos/minpoker-game.dto';

@Controller('minpoker/games')
@ApiTags(MinApp.MinPoker)
export class MinPokerGameController {
  @Get()
  @HttpCode(200)
  @UseGuards(AuthenticationGuard)
  @ApiOperation({ operationId: 'getAllMinPokerGamesForUser' })
  @API_200({ isArray: true, type: MinPokerGameDto })
  @API_401()
  @API_500()
  public getAll(): MinPokerGameDto[] {
    // TODO: In einer späteren Iteration den authenticated @User verwenden und nur eigene Games zurückgeben.
    return [
      {
        bigBlind: 100,
        createdAt: new Date('2026-03-24T18:45:30.000Z'),
        id: '550e8400-e29b-41d4-a716-446655440000',
        maxPlayerCount: 9,
        name: 'Evening Table',
        observerCount: 2,
        playerCount: 4,
        smallBlind: 50,
      },
      {
        bigBlind: 200,
        createdAt: new Date('2026-03-24T19:10:00.000Z'),
        id: '660e8400-e29b-41d4-a716-446655440000',
        maxPlayerCount: 6,
        name: 'Turbo Sit and Go',
        observerCount: 1,
        playerCount: 3,
        smallBlind: 100,
      },
    ];
  }
}
