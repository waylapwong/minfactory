import { applyDecorators, UseGuards } from '@nestjs/common';
import { ApiHeader } from '@nestjs/swagger';
import { RequestIdGuard } from '../../core/request/guards/request-id.guard';
import { API_400 } from './api-400.decorator';

export function API_HEADER_REQUEST_ID() {
  return applyDecorators(
    ApiHeader({
      description: 'Unique request ID',
      example: '80210e8c-9688-4369-a20a-4d69d1187dd7',
      name: 'X-Request-Id',
      required: true,
    }),
    UseGuards(RequestIdGuard),
    API_400(),
  );
}
