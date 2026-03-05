import { ConflictException } from '@nestjs/common';

export class GameRuleException extends ConflictException {
  constructor(message: string) {
    super(message);
  }
}
