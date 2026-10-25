import { ApiProperty } from '@nestjs/swagger';
import { MinAdventDoorStatus } from '../enums/minadvent-door-status.enum';
import { MinAdventBlockDto } from './minadvent-block.dto';

export class MinAdventDoorDto {
  @ApiProperty({ minimum: 1, maximum: 24 })
  public day: number;

  @ApiProperty({ enum: MinAdventDoorStatus, enumName: 'MinAdventDoorStatus' })
  public status: MinAdventDoorStatus;

  @ApiProperty({ type: [MinAdventBlockDto] })
  public blocks: MinAdventBlockDto[];
}
