import { ApiProperty } from '@nestjs/swagger';

export class MinAdventSharingResponseDto {
  @ApiProperty()
  public published!: boolean;

  @ApiProperty({ required: false })
  public sharedUrl?: string;

  @ApiProperty()
  public version!: number;

  @ApiProperty()
  public completed!: boolean;
}
