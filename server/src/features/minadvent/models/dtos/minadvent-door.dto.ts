import { ApiProperty } from '@nestjs/swagger';
import { MinAdventDoorStatus } from '../enums/minadvent-door-status.enum';
import { MinAdventBlockDto } from './minadvent-block.dto';

export class MinAdventDoorDto {
  @ApiProperty({
    description: 'Contents of the MinAdvent door.',
    type: [MinAdventBlockDto],
  })
  public contents: MinAdventBlockDto[];
  @ApiProperty({
    description: 'Day of the MinAdvent door, from 1 to 24.',
    maximum: 24,
    minimum: 1,
  })
  public day: number;
  @ApiProperty({
    description: 'Status of the MinAdvent door.',
    enum: MinAdventDoorStatus,
    enumName: 'MinAdventDoorStatus',
  })
  public status: MinAdventDoorStatus;
}
