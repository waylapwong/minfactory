import { ApiProperty } from '@nestjs/swagger';
import { MinAdventDoorDto } from './minadvent-door.dto';

export class MinAdventCalendarDto {
  @ApiProperty()
  public id!: string;

  @ApiProperty({ maxLength: 100 })
  public title!: string;

  @ApiProperty({ maxLength: 100 })
  public recipientName!: string;

  @ApiProperty()
  public year!: number;

  @ApiProperty()
  public version!: number;

  @ApiProperty()
  public published!: boolean;

  @ApiProperty()
  public completed!: boolean;

  @ApiProperty({ type: [MinAdventDoorDto] })
  public doors!: MinAdventDoorDto[];
}
