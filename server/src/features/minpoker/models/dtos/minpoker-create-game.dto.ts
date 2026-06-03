import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString, MaxLength, MinLength } from 'class-validator';
import { MinPokerGameVisibility } from '../enums/minpoker-game-visibility.enum';

export class MinPokerCreateGameDto {
  @ApiProperty({ enum: MinPokerGameVisibility, enumName: 'MinPokerGameVisibility', example: MinPokerGameVisibility.Public })
  @IsEnum(MinPokerGameVisibility)
  public visibility!: MinPokerGameVisibility;
  @ApiProperty({ example: 'Test Name', maxLength: 32, minLength: 2, required: true })
  @IsString()
  @MaxLength(32)
  @MinLength(2)
  public name!: string;
}
