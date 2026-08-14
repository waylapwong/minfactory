import { HttpStatus } from '@nestjs/common';
import { MinRpsErrorDto } from '../../models/dtos/minrps-error.dto';
import { MinRpsErrorCode } from '../error-codes/minrps-error-codes';

export class MinRpsGameSaveFailedException extends MinRpsErrorDto {
  constructor(gameId: string, requestId: string) {
    super(
      {
        errorCode: MinRpsErrorCode.Game.SaveFailed,
        requestId,
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        properties: { gameId },
      },
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}
