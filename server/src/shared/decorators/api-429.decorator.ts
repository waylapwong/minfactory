import { applyDecorators } from '@nestjs/common';
import { ApiTooManyRequestsResponse } from '@nestjs/swagger';

export function API_429() {
  return applyDecorators(
    ApiTooManyRequestsResponse({
      description: 'Too Many Requests',
      schema: {
        type: 'object',
        properties: {
          code: { type: 'string', example: 'SHARED_RATE_LIMITED' },
          message: { type: 'string', example: 'Zu viele Anfragen. Bitte versuche es später erneut.' },
        },
        required: ['code', 'message'],
        example: {
          code: 'SHARED_RATE_LIMITED',
          message: 'Zu viele Anfragen. Bitte versuche es später erneut.',
        },
      },
    }),
  );
}
