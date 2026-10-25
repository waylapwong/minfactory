import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../../../../core/authorization/enums/user-role.enum';

export class MinFactoryUserDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  public id: string;
  @ApiProperty({ example: '2025-10-21T18:45:30.000Z' })
  public createdAt: Date;
  @ApiProperty({ example: 'user@example.com' })
  public email: string;
  @ApiProperty({ enum: UserRole, example: UserRole.User })
  public role: UserRole;
}
