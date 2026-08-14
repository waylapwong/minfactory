import { HttpException, HttpStatus } from '@nestjs/common';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class MinRpsErrorDto extends HttpException {
  @ApiProperty({ example: 'XXX.XXX.XXX' })
  public errorCode!: string;
  @ApiProperty({ example: 'XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX', format: 'uuid' })
  public requestId!: string;
  @ApiProperty({ example: HttpStatus.INTERNAL_SERVER_ERROR })
  public statusCode!: number;
  @ApiPropertyOptional({ example: { lorem: 'ipsum' }, additionalProperties: true })
  public properties?: Record<string, string>;
}
