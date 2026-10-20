import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsInt, Min } from 'class-validator';

export class MinAdventSharingUpdateDto {
  @ApiProperty()
  @IsBoolean()
  public published!: boolean;

  @ApiProperty()
  @IsInt()
  @Min(1)
  public expectedVersion!: number;
}
