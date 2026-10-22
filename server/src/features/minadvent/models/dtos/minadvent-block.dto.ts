import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MinAdventDoorContentType } from '../enums/minadvent-door-content-type.enum';

export class MinAdventBlockDto {
  @ApiProperty({
    description: 'Position of the MinAdvent door, from 1 to 10.',
    maximum: 10,
    minimum: 1,
  })
  public position: number;
  @ApiProperty({
    description: 'Type of the MinAdvent door content.',
    enum: MinAdventDoorContentType,
    enumName: 'MinAdventDoorContentType',
  })
  public type: MinAdventDoorContentType;
  @ApiPropertyOptional({
    description: 'Description of the MinAdvent door content.',
    maxLength: 200,
    nullable: true,
    type: String,
  })
  public description: string;
  @ApiPropertyOptional({
    description: 'Sanitized HTML with a limited formatting allowlist; maximum 500 visible characters.',
    nullable: true,
    type: String,
  })
  public text: string;
  @ApiPropertyOptional({
    description: 'Title of the MinAdvent door content.',
    maxLength: 50,
    nullable: true,
    type: String,
  })
  public title: string;
  @ApiPropertyOptional({
    description: 'URL of the MinAdvent door content.',
    format: 'uri',
    maxLength: 50,
    nullable: true,
    type: String,
  })
  public url: string;
}
