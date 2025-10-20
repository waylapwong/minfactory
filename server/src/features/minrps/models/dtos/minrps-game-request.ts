import { ApiProperty } from '@nestjs/swagger';

import { IsDefined, IsString, MaxLength, MinLength } from 'class-validator';

export class MinRPSGameRequestDto {
  @ApiProperty({ required: false, example: 'Jon Doe' })
  @IsDefined()
  @IsString()
  @MaxLength(32)
  @MinLength(2)
  public name: string;
}
