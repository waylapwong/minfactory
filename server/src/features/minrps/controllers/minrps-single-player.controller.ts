import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { MinRpsPlayResultDto } from '../models/dtos/minrps-play-result.dto';
import { MinRpsPlayDto } from '../models/dtos/minrps-play.dto';
import { MinRpsSinglePlayerService } from '../services/minrps-single-player.service';
import { API_201 } from 'src/shared/decorators/api-201.decorator';
import { API_400 } from 'src/shared/decorators/api-400.decorator';
import { API_409 } from 'src/shared/decorators/api-409.decorator';
import { API_500 } from 'src/shared/decorators/api-500.decorator';
import { MinApp } from 'src/shared/enums/minapp.enum';

@Controller('minrps')
@ApiTags(MinApp.MinRpsMatch)
export class MinRpsSinglePlayerController {
  constructor(private readonly singlePlayerService: MinRpsSinglePlayerService) {}

  @Post('play')
  @HttpCode(201)
  @ApiOperation({ operationId: 'play' })
  @API_201({ type: MinRpsPlayResultDto })
  @API_400()
  @API_409()
  @API_500()
  public play(@Body() dto: MinRpsPlayDto): MinRpsPlayResultDto {
    return this.singlePlayerService.play(dto);
  }
}
