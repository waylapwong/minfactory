import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min } from 'class-validator';

export class MinAdventCalendarDeleteDto {
  @ApiProperty()
  @IsInt()
  @Min(1)
  public expectedVersion: number;
}
