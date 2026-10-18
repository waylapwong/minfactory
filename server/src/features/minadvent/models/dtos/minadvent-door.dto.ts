import { ApiProperty } from '@nestjs/swagger';
import { MinAdventDoorStatus } from '../enums/minadvent-door-status.enum';

export class MinAdventDoorDto {
  @ApiProperty({ minimum: 1, maximum: 24 })
  public day!: number;

  @ApiProperty({ enum: MinAdventDoorStatus })
  public status!: MinAdventDoorStatus;
}
