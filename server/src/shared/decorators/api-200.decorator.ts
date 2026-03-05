import { applyDecorators } from '@nestjs/common';
import { ApiOkResponse, ApiResponseNoStatusOptions } from '@nestjs/swagger';

export function API_200(options?: ApiResponseNoStatusOptions) {
  return applyDecorators(ApiOkResponse({ ...options, description: 'OK' }));
}
