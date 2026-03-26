import { ApiProperty } from '@nestjs/swagger';
import { MinFactoryRole } from 'src/shared/enums/minfactory-role.enum';

export class MinFactoryUserDto {
  @ApiProperty({ example: '2025-10-21T18:45:30.000Z' })
  public createdAt: Date;
  @ApiProperty({ example: 'user@example.com' })
  public email: string;
  @ApiProperty({ enum: MinFactoryRole, example: MinFactoryRole.User })
  public role: MinFactoryRole;
}
