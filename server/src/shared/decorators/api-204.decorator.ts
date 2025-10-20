import { HttpCode, HttpStatus, applyDecorators } from '@nestjs/common';
import { ApiNoContentResponse } from '@nestjs/swagger';

export function API_204() {
  return applyDecorators(
    HttpCode(HttpStatus.NO_CONTENT),
    ApiNoContentResponse({ description: 'Deleted successfully' }),
  );
}
