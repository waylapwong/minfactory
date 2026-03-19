import { applyDecorators } from '@nestjs/common';
import { ApiUnauthorizedResponse } from '@nestjs/swagger';

export function API_401() {
  return applyDecorators(ApiUnauthorizedResponse({ description: 'Unauthorized' }));
}
