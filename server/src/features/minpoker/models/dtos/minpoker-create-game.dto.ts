import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsString, MaxLength, MinLength } from 'class-validator';

export class MinPokerCreateGameDto {
  @ApiProperty({ example: true, required: true })
  @IsBoolean()
  public isPublic!: boolean;
  @ApiProperty({ example: 'Test Name', maxLength: 32, minLength: 2, required: true })
  @IsString()
  @MaxLength(32)
  @MinLength(2)
  public name!: string;
}
