import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { MinRpsMove } from '../enums/minrps-move.enum';

export class MinRpsPlayDto {
  @ApiProperty({ enum: MinRpsMove, enumName: 'MinRpsMove', example: MinRpsMove.Rock, required: true })
  @IsEnum(MinRpsMove)
  @IsNotEmpty()
  public player1Move!: MinRpsMove;
}
