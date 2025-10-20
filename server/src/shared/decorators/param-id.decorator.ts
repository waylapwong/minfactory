import { applyDecorators } from '@nestjs/common';
import { ApiParam } from '@nestjs/swagger';

export function API_Param_ID() {
  return applyDecorators(
    ApiParam({
      description: 'UUID of ressource',
      example: '550e8400-e29b-41d4-a716-446655440000',
      name: 'id',
    }),
  );
}
