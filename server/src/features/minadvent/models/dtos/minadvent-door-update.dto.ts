import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsInt, Min } from 'class-validator';
import { MinAdventBlockDto } from './minadvent-block.dto';

export class MinAdventDoorUpdateDto {
  @ApiProperty({ type: [MinAdventBlockDto], maxItems: 10 })
  @IsArray()
  public blocks: MinAdventBlockDto[];

  @ApiProperty({ minimum: 1 })
  @IsInt()
  @Min(1)
  public expectedVersion: number;
}
