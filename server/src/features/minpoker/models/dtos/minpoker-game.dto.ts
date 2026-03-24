import { ApiProperty } from '@nestjs/swagger';

export class MinPokerGameDto {
  @ApiProperty({ example: 100, minimum: 1 })
  public bigBlind: number;

  @ApiProperty({ example: '2026-03-24T18:45:30.000Z' })
  public createdAt: Date;

  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000', format: 'uuid' })
  public id: string;

  @ApiProperty({ example: 9, minimum: 2 })
  public maxPlayerCount: number;

  @ApiProperty({ example: 'Evening Table', maxLength: 32, minLength: 2 })
  public name: string;

  @ApiProperty({ example: 2, minimum: 0 })
  public observerCount: number;

  @ApiProperty({ example: 4, minimum: 0 })
  public playerCount: number;

  @ApiProperty({ example: 50, minimum: 1 })
  public smallBlind: number;
}
