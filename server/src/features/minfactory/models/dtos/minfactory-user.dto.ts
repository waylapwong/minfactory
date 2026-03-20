import { ApiProperty } from '@nestjs/swagger';

export class MinFactoryUserDto {
  @ApiProperty({ example: '2025-10-21T18:45:30.000Z' })
  public createdAt: Date;
  @ApiProperty({ example: 'user@example.com' })
  public email: string;
}
