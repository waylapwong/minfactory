import { HttpStatus, NotFoundException } from '@nestjs/common';
import { MinFactoryErrorCode } from '../error-codes/minfactory-error-codes';

export class MinRpsGameNotFoundException extends NotFoundException {
  constructor(gameId: string, requestId: string) {
    super({
      errorCode: MinFactoryErrorCode.Game.NotFound,
      message: `minRPS game with ID ${gameId} not found`,
      requestId,
      statusCode: HttpStatus.NOT_FOUND,
    });
  }
}
