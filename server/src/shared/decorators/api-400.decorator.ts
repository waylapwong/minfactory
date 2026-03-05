import { applyDecorators } from '@nestjs/common';
import { ApiBadRequestResponse } from '@nestjs/swagger';

export function API_400() {
  return applyDecorators(ApiBadRequestResponse({ description: 'Bad Request' }));
}
