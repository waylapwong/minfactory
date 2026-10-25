import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsInt, Min } from 'class-validator';
import { MinAdventDoorStatus } from '../enums/minadvent-door-status.enum';

export class MinAdventDoorStatusUpdateDto {
  @ApiProperty({ enum: [MinAdventDoorStatus.Filled] })
  @IsIn([MinAdventDoorStatus.Filled])
  public status: MinAdventDoorStatus.Filled;

  @ApiProperty({ minimum: 1 })
  @IsInt()
  @Min(1)
  public expectedVersion: number;
}
