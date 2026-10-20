import { ApiProperty } from '@nestjs/swagger';
import { MinAdventDoorStatus } from '../enums/minadvent-door-status.enum';

export class MinAdventDoorUpdateResponseDto {
  @ApiProperty({ minimum: 1, maximum: 24 })
  public day!: number;

  @ApiProperty({ enum: MinAdventDoorStatus, enumName: 'MinAdventDoorStatus' })
  public status!: MinAdventDoorStatus;

  @ApiProperty()
  public version!: number;

  @ApiProperty()
  public completed!: boolean;
}
