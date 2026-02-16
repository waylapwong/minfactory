import { ApiProperty } from '@nestjs/swagger';
import { MinRpsResult } from '../enums/minrps-game-result.enum';
import { MinRpsMove } from '../enums/minrps-move.enum';

export class MinRpsPlayResultDto {
  @ApiProperty({
    enum: MinRpsMove,
    enumName: 'MinRpsMove',
    example: MinRpsMove.Rock,
  })
  public player1Move: MinRpsMove;
  @ApiProperty({
    enum: MinRpsMove,
    enumName: 'MinRpsMove',
    example: MinRpsMove.Rock,
  })
  public player2Move: MinRpsMove;
  @ApiProperty({
    enum: MinRpsResult,
    enumName: 'MinRpsResult',
    example: MinRpsResult.Draw,
  })
  public result: MinRpsResult;
}
