import { UseGuards, applyDecorators } from '@nestjs/common';
import { ApiHeader } from '@nestjs/swagger';
import { RequestIdGuard } from '../../core/tracing/guards/request-id.guard';

export function API_HEADER_REQUEST_ID() {
  return applyDecorators(
    ApiHeader({
      description: 'Unique request ID',
      example: '80210e8c-9688-4369-a20a-4d69d1187dd7',
      name: 'X-Request-Id',
      required: true,
    }),
    UseGuards(RequestIdGuard),
  );
}
