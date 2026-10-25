import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString, Max, MaxLength, Min, MinLength } from 'class-validator';
import { Trim } from '../../../../shared/decorators/trim.decorator';

export class MinAdventCalendarCreateDto {
  @ApiProperty({ minimum: 1, maximum: 9999, example: new Date().getFullYear() })
  @IsInt()
  @Min(1)
  @Max(9999)
  public year: number;
  @ApiProperty({ maxLength: 50 })
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  public recipientName: string;
  @ApiProperty({ maxLength: 50 })
  @Trim()
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  public title: string;
}
