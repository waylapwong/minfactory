import { ApiProperty } from '@nestjs/swagger';
import { MinRpsMove } from '../enums/minrps-move.enum';

export class MinRpsMatchResponseDto {
  @ApiProperty({
    enum: MinRpsMove,
    enumName: 'MinRpsMove',
    example: MinRpsMove.Rock,
  })
  public opponentMove: MinRpsMove;
  @ApiProperty({
    enum: MinRpsMove,
    enumName: 'MinRpsMove',
    example: MinRpsMove.Rock,
  })
  public playerMove: MinRpsMove;
  @ApiProperty({
    example: true,
  })
  public isPlayerWinner: boolean;
}
