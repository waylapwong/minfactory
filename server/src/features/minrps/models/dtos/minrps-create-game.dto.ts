import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsString, MaxLength, MinLength } from 'class-validator';

export class MinRpsCreateGameDto {
  @ApiProperty({ description: 'Game name', example: 'Test Game', required: true })
  @IsString()
  @MaxLength(16)
  @MinLength(2)
  @Transform(({ value }) => value.trim())
  public name: string;
}
