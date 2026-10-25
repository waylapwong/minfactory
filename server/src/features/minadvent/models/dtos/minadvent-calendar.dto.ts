import { ApiProperty } from '@nestjs/swagger';
import { MinAdventDoorDto } from './minadvent-door.dto';

export class MinAdventCalendarDto {
  @ApiProperty()
  public completed: boolean;
  @ApiProperty({ type: [MinAdventDoorDto] })
  public doors: MinAdventDoorDto[];
  @ApiProperty()
  public id: string;
  @ApiProperty()
  public published: boolean;
  @ApiProperty({ maxLength: 50 })
  public recipientName: string;
  @ApiProperty({ maxLength: 50 })
  public title: string;
  @ApiProperty()
  public version: number;
  @ApiProperty()
  public year: number;
}
