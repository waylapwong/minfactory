import { HttpCode, HttpStatus, applyDecorators } from '@nestjs/common';
import { ApiNoContentResponse, ApiResponseNoStatusOptions } from '@nestjs/swagger';

export function Created(options?: ApiResponseNoStatusOptions) {
  return applyDecorators(HttpCode(HttpStatus.CREATED), ApiNoContentResponse(options));
}
