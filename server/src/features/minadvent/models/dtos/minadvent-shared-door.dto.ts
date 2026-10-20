import { ApiProperty } from '@nestjs/swagger';
import { MinAdventDoorStatus } from '../enums/minadvent-door-status.enum';

export class MinAdventSharedDoorDto {
  @ApiProperty()
  public day!: number;

  @ApiProperty({ enum: MinAdventDoorStatus, enumName: 'MinAdventDoorStatus' })
  public status!: MinAdventDoorStatus;
}
