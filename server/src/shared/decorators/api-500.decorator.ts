import { applyDecorators } from '@nestjs/common';
import { ApiInternalServerErrorResponse } from '@nestjs/swagger';

export function API_500() {
  return applyDecorators(ApiInternalServerErrorResponse({ description: 'Internal Server Error' }));
}
