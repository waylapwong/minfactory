import { ApiProperty } from '@nestjs/swagger';

// TODO: in CalendarDto hinzufügen
export class MinAdventSharingResponseDto {
  @ApiProperty()
  public completed!: boolean;
  @ApiProperty()
  public published!: boolean;
  @ApiProperty({ required: false })
  public sharedUrl?: string;
  @ApiProperty()
  public version!: number;
}
