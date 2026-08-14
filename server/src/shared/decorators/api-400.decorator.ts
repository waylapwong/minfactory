import { applyDecorators } from '@nestjs/common';
import { ApiBadRequestResponse, ApiResponseOptions } from '@nestjs/swagger';

export function API_400(options?: ApiResponseOptions) {
  return applyDecorators(ApiBadRequestResponse({ description: 'Bad Request', ...options }));
}
