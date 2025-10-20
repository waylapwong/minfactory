import { HttpCode, HttpStatus, applyDecorators } from '@nestjs/common';
import { ApiNoContentResponse } from '@nestjs/swagger';

export function NoContent() {
  return applyDecorators(
    HttpCode(HttpStatus.NO_CONTENT),
    ApiNoContentResponse({ description: 'Deleted successfully' }),
  );
}
