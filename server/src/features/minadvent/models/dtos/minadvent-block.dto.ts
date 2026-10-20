import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MinAdventBlockType } from '../enums/minadvent-block-type.enum';

export class MinAdventBlockDto {
  @ApiPropertyOptional({ type: String, nullable: true, maxLength: 2000 })
  public description?: string | null;

  @ApiProperty({ minimum: 1, maximum: 10 })
  public position!: number;

  @ApiPropertyOptional({
    type: String,
    nullable: true,
    maxLength: 10000,
    description: 'Sanitized HTML with a limited formatting allowlist.',
  })
  public text?: string | null;

  @ApiPropertyOptional({ type: String, nullable: true, maxLength: 100 })
  public title?: string | null;

  @ApiProperty({ enum: MinAdventBlockType, enumName: 'MinAdventBlockType' })
  public type!: MinAdventBlockType;

  @ApiPropertyOptional({ type: String, nullable: true, maxLength: 2048, format: 'uri' })
  public url?: string | null;
}
