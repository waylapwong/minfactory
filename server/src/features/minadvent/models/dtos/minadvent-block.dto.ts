import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MinAdventDoorContentType } from '../enums/minadvent-door-content-type.enum';

export class MinAdventBlockDto {
  @ApiPropertyOptional({ type: String, nullable: true, maxLength: 200 })
  public description?: string | null;

  @ApiProperty({ minimum: 1, maximum: 10 })
  public position!: number;

  @ApiPropertyOptional({
    type: String,
    nullable: true,
    description: 'Sanitized HTML with a limited formatting allowlist; maximum 500 visible characters.',
  })
  public text?: string | null;

  @ApiPropertyOptional({ type: String, nullable: true, maxLength: 50 })
  public title?: string | null;

  @ApiProperty({ enum: MinAdventDoorContentType, enumName: 'MinAdventBlockType' })
  public type!: MinAdventDoorContentType;

  @ApiPropertyOptional({ type: String, nullable: true, maxLength: 50, format: 'uri' })
  public url?: string | null;
}
