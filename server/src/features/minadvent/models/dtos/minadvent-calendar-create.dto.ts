import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString, Max, MaxLength, Min, MinLength } from 'class-validator';

export class MinAdventCalendarCreateDto {
  @ApiProperty({ minimum: 1, maximum: 9999, example: new Date().getFullYear() })
  @IsInt()
  @Min(1)
  @Max(9999)
  public year!: number;
  @ApiProperty({ maxLength: 100 })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  public recipientName!: string;
  @ApiProperty({ maxLength: 100 })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  public title!: string;
}
