import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min } from 'class-validator';

export class MinAdventSharedDoorOpenDto {
  @ApiProperty({ minimum: 1 })
  @IsInt()
  @Min(1)
  public expectedVersion: number;
}
