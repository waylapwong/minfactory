import { ApiProperty } from '@nestjs/swagger';
import { MinAdventDoorStatus } from '../entities/minadvent-door.entity';

export class MinAdventDoorDto {
  @ApiProperty({ minimum: 1, maximum: 24 })
  public day!: number;

  @ApiProperty({ enum: MinAdventDoorStatus })
  public status!: MinAdventDoorStatus;
}

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
