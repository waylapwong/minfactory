import { applyDecorators } from '@nestjs/common';
import { ApiNotFoundResponse, ApiResponseOptions } from '@nestjs/swagger';

export function API_404(options?: ApiResponseOptions) {
  return applyDecorators(ApiNotFoundResponse({ description: 'Not Found', ...options }));
}
