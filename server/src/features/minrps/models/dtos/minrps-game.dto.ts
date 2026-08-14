import { ApiProperty } from '@nestjs/swagger';

export class MinRpsGameDto {
  @ApiProperty({ example: '2000-01-01T00:00:00.000Z' })
  public createdAt!: Date;
  @ApiProperty({ example: 'XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX', format: 'uuid' })
  public id!: string;
  @ApiProperty({ example: 'Lorem ipsum', maxLength: 16, minLength: 2 })
  public name!: string;
  @ApiProperty({ example: 1, minimum: 0 })
  public observerCount!: number;
  @ApiProperty({ example: 1, minimum: 0 })
  public playerCount!: number;
}
