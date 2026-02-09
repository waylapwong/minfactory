import { applyDecorators } from '@nestjs/common';
import { ApiConflictResponse } from '@nestjs/swagger';

export function API_409() {
  return applyDecorators(ApiConflictResponse({ description: 'Conflict' }));
}
