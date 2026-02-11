import { ApiProperty } from '@nestjs/swagger';

export class MinRpsGameDto {
  @ApiProperty({ example: '2025-10-21T18:45:30.000Z' })
  public createdAt: Date;
  @ApiProperty({ example: 1, minimum: 0 })
  public observerCount: number;
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    format: 'uuid',
  })
  public id: string;
  @ApiProperty({
    example: 'Test Game',
    maxLength: 16,
    minLength: 2,
  })
  public name: string;
  @ApiProperty({
    example: 1,
    minimum: 0,
  })
  public playerCount: number;
}
