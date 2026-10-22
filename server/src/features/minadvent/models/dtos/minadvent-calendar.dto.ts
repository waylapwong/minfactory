import { ApiProperty } from '@nestjs/swagger';
import { MinAdventDoorDto } from './minadvent-door.dto';

export class MinAdventCalendarDto {
  @ApiProperty({
    description: 'Doors in the MinAdvent calendar.',
    type: [MinAdventDoorDto],
  })
  public doors: MinAdventDoorDto[];
  @ApiProperty({
    description: 'Identifier of the MinAdvent calendar.',
  })
  public id: string;
  @ApiProperty({
    description: 'Indicates whether the MinAdvent calendar is completed.',
  })
  public completed: boolean;
  @ApiProperty({
    description: 'Indicates whether the MinAdvent calendar is shared.',
  })
  public shared: boolean;
  @ApiProperty({
    description: 'Recipient of the MinAdvent calendar.',
    maxLength: 50,
  })
  public recipient: string;
  @ApiProperty({
    description: 'Share token for the MinAdvent calendar.',
  })
  public shareToken: string;
  @ApiProperty({
    description: 'Title of the MinAdvent calendar.',
    maxLength: 50,
  })
  public title: string;
  @ApiProperty({
    description: 'Version of the MinAdvent calendar.',
  })
  public version: number;
  @ApiProperty({
    description: 'Year of the MinAdvent calendar.',
  })
  public year: number;
}
