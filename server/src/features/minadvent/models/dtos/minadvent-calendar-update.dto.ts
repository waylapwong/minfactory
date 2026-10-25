import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Max, MaxLength, Min, MinLength } from 'class-validator';

export class MinAdventCalendarUpdateDto {
  @ApiProperty({ minimum: 1 })
  @IsInt()
  @Min(1)
  @Max(9999)
  public expectedVersion: number;
  @ApiPropertyOptional({ maxLength: 50 })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  public recipientName?: string;
  @ApiPropertyOptional({ maxLength: 50 })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  public title?: string;
}
