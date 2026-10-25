import { ApiProperty } from '@nestjs/swagger';
import { MinAdventSharedDoorDto } from './minadvent-shared-door.dto';

export class MinAdventSharedCalendarDto {
  @ApiProperty()
  public title: string;

  @ApiProperty()
  public recipientName: string;

  @ApiProperty()
  public year: number;

  @ApiProperty()
  public version: number;

  @ApiProperty()
  public completed: boolean;

  @ApiProperty({ type: MinAdventSharedDoorDto, isArray: true })
  public doors: MinAdventSharedDoorDto[];
}
