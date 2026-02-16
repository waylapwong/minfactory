import { applyDecorators } from '@nestjs/common';
import { ApiNotFoundResponse } from '@nestjs/swagger';

export function API_404() {
  return applyDecorators(ApiNotFoundResponse({ description: 'Not Found' }));
}
