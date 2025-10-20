import { applyDecorators } from '@nestjs/common';
import { ApiBadRequestResponse } from '@nestjs/swagger';

export function API_404() {
  return applyDecorators(ApiBadRequestResponse({ description: 'Not Found' }));
}
