import { ApiProperty } from '@nestjs/swagger';

import { IsString, IsUUID } from 'class-validator';

export class MinRPSGameResponseDTO {
  @ApiProperty({
    description: 'Player name',
    example: 'Jon Doe',
    maxLength: 32,
    minLength: 2,
  })
  @IsString()
  public name: string;
  @ApiProperty({
    description: 'Unique game identifier (UUID v4)',
    example: '550e8400-e29b-41d4-a716-446655440000',
    format: 'uuid',
  })
  @IsUUID('4')
  public id: string;
}
