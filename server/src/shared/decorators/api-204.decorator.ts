import { applyDecorators } from '@nestjs/common';
import { ApiNoContentResponse } from '@nestjs/swagger';

export function API_204() {
  return applyDecorators(ApiNoContentResponse({ description: 'Deleted' }));
}
