import { HttpStatus } from '@nestjs/common';
import { MinRpsErrorDto } from '../../models/dtos/minrps-error.dto';
import { MinRpsErrorCode } from '../error-codes/minrps-error-codes';

export class MinRpsGameNotFoundException extends MinRpsErrorDto {
  constructor(gameId: string, requestId: string) {
    super(
      {
        errorCode: MinRpsErrorCode.Game.NotFound,
        requestId,
        statusCode: HttpStatus.NOT_FOUND,
        properties: { gameId },
      },
      HttpStatus.NOT_FOUND,
    );
  }
}
