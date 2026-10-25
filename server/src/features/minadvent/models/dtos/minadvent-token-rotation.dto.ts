import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min } from 'class-validator';

export class MinAdventTokenRotationDto {
  @ApiProperty()
  @IsInt()
  @Min(1)
  public expectedVersion: number;
}
