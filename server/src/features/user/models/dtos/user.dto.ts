import { ApiProperty } from '@nestjs/swagger';

export class UserDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000', format: 'uuid' })
  public id: string;

  @ApiProperty({ example: 'user@example.com' })
  public email: string;

  @ApiProperty({ example: '2025-10-21T18:45:30.000Z' })
  public createdAt: Date;
}
