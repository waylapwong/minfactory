import { ApiProperty } from '@nestjs/swagger';

import { Transform } from 'class-transformer';
import { IsString, MaxLength, MinLength } from 'class-validator';

export class MinRpsGameRequestDto {
  @ApiProperty({ required: true, description: 'player name', example: 'Jon Doe' })
  @IsString()
  @MaxLength(16)
  @MinLength(2)
  @Transform(({ value }) => value.trim())
  public name: string;
}
