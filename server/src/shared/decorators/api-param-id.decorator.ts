import { applyDecorators } from '@nestjs/common';
import { ApiParam } from '@nestjs/swagger';

export function API_PARAM_ID() {
  return applyDecorators(
    ApiParam({
      description: 'Unique ID of resource',
      example: '550e8400-e29b-41d4-a716-446655440000',
      name: 'id',
    }),
  );
}
