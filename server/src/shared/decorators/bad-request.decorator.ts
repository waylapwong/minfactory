import { applyDecorators } from '@nestjs/common';
import { ApiBadRequestResponse } from '@nestjs/swagger';

export function BadRequest() {
  return applyDecorators(ApiBadRequestResponse({ description: 'Bad Request' }));
}
