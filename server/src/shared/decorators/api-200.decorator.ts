import { HttpCode, HttpStatus, applyDecorators } from '@nestjs/common';
import { ApiOkResponse, ApiResponseNoStatusOptions } from '@nestjs/swagger';

export function API_200(options?: ApiResponseNoStatusOptions) {
  return applyDecorators(HttpCode(HttpStatus.OK), ApiOkResponse({ ...options, description: 'OK' }));
}
