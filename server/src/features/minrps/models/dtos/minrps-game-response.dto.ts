import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsInt, IsString, IsUUID, Max, Min } from 'class-validator';

export class MinRpsGameResponseDto {
  @ApiProperty({
    description: 'Game name',
    example: 'Test Game',
    minLength: 2,
    maxLength: 16,
  })
  @IsString()
  public name: string;
  @ApiProperty({
    description: 'Number of observers currently watching the game',
    example: 1,
    minimum: 0,
  })
  @IsInt()
  @Min(0)
  public observers: number;
  @ApiProperty({
    description: 'Number of players currently in the game',
    example: 2,
    minimum: 0,
  })
  @IsInt()
  @Max(2)
  @Min(0)
  public players: number;
  @ApiProperty({
    description: 'Timestamp when the game was created (UTC)',
    example: '2025-10-21T18:45:30.000Z',
    format: 'date-time',
  })
  @IsDate()
  @Type(() => Date)
  public createdAt: Date;
  @ApiProperty({
    description: 'Unique game identifier',
    example: '550e8400-e29b-41d4-a716-446655440000',
    format: 'uuid',
  })
  @IsUUID('4')
  public id: string;
}
