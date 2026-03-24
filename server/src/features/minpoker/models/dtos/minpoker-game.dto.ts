import { ApiProperty } from '@nestjs/swagger';

export class MinPokerGameDto {
  @ApiProperty({ example: 2, minimum: 2, maximum: 2 })
  public bigBlind: number;
  @ApiProperty({ example: '2026-03-24T18:45:30.000Z' })
  public createdAt: Date;
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000', format: 'uuid' })
  public id: string;
  @ApiProperty({ example: 'Test Name', maxLength: 32, minLength: 2 })
  public name: string;
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000', format: 'uuid' })
  public creatorId: string;
  @ApiProperty({ example: 10, minimum: 0 })
  public observerCount: number;
  @ApiProperty({ example: 3, minimum: 0, maximum: 6 })
  public playerCount: number;
  @ApiProperty({ example: 1, minimum: 1, maximum: 1 })
  public smallBlind: number;
  @ApiProperty({ example: 6, minimum: 6, maximum: 6 })
  public tableSize: number;
}
