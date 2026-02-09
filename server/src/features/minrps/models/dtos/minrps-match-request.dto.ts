import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { MinRpsMove } from '../enums/minrps-move.enum';

export class MinRpsMatchRequestDto {
  @ApiProperty({
    description: 'Player move',
    enum: MinRpsMove,
    enumName: 'MinRpsMove',
    example: MinRpsMove.Rock,
    required: true,
  })
  @IsNotEmpty()
  @IsEnum(MinRpsMove)
  public playerMove: MinRpsMove;
}
