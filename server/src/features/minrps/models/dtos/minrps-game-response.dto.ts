import { ApiProperty } from '@nestjs/swagger';

import { Type } from 'class-transformer';
import { IsDate, IsString, IsUUID } from 'class-validator';

export class MinRpsGameResponseDto {
  @ApiProperty({
    description: 'Game name',
    example: 'Jon Doe Game',
    minLength: 2,
    maxLength: 32,
  })
  @IsString()
  public name: string;
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
