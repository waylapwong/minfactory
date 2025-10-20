import { applyDecorators } from '@nestjs/common';
import { ApiInternalServerErrorResponse } from '@nestjs/swagger';

export function InternalServerError() {
  return applyDecorators(ApiInternalServerErrorResponse({ description: 'Internal Server Error' }));
}
