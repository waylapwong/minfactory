import { applyDecorators } from '@nestjs/common';
import { ApiCreatedResponse, ApiResponseNoStatusOptions } from '@nestjs/swagger';

export function API_201(options?: ApiResponseNoStatusOptions) {
  return applyDecorators(ApiCreatedResponse({ ...options, description: 'Created' }));
}
