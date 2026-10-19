import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MinAdventBlockType } from '../enums/minadvent-block-type.enum';

export class MinAdventBlockDto {
  @ApiPropertyOptional({ maxLength: 2000 })
  public description?: string | null;

  @ApiProperty({ minimum: 1, maximum: 10 })
  public position!: number;

  @ApiPropertyOptional({ maxLength: 10000, description: 'Sanitized HTML with a limited formatting allowlist.' })
  public text?: string | null;

  @ApiPropertyOptional({ maxLength: 100 })
  public title?: string | null;

  @ApiProperty({ enum: MinAdventBlockType })
  public type!: MinAdventBlockType;

  @ApiPropertyOptional({ maxLength: 2048, format: 'uri' })
  public url?: string | null;
}
