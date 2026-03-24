import { applyDecorators } from '@nestjs/common';
import { ApiForbiddenResponse } from '@nestjs/swagger';

export function API_403() {
  return applyDecorators(ApiForbiddenResponse({ description: 'Forbidden' }));
}
