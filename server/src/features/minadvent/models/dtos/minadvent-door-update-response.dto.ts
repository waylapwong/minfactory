import { ApiProperty } from '@nestjs/swagger';
import { MinAdventDoorStatus } from '../enums/minadvent-door-status.enum';

// TODO: Umbenennen
export class MinAdventDoorUpdateResponseDto {
  @ApiProperty()
  public completed!: boolean;
  @ApiProperty({ minimum: 1, maximum: 24 })
  public day!: number;
  @ApiProperty({ enum: MinAdventDoorStatus, enumName: 'MinAdventDoorStatus' })
  public status!: MinAdventDoorStatus;
  @ApiProperty()
  public version!: number;
}
