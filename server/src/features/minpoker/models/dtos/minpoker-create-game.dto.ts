import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsString, MaxLength, MinLength } from 'class-validator';

export class MinPokerCreateGameDto {
  @ApiProperty({ example: 'Test Name', maxLength: 16, minLength: 2, required: true })
  @IsString()
  @MaxLength(16)
  @MinLength(2)
  @Transform(({ value }) => value.trim())
  public name: string;
}
