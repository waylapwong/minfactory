import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { MinRpsPlayResultDto } from '../models/dtos/minrps-play-result.dto';
import { MinRpsPlayDto } from '../models/dtos/minrps-play.dto';
import { MinRpsSingleplayerService } from '../services/minrps-singleplayer.service';
import { API_201 } from 'src/shared/decorators/api-201.decorator';
import { API_400 } from 'src/shared/decorators/api-400.decorator';
import { API_409 } from 'src/shared/decorators/api-409.decorator';
import { API_500 } from 'src/shared/decorators/api-500.decorator';
import { AppName } from 'src/shared/enums/app-name.enum';

@Controller('minrps')
@ApiTags(AppName.MinRps)
export class MinRpsSingleplayerController {
  constructor(private readonly singleplayerService: MinRpsSingleplayerService) {}

  @Post('play')
  @HttpCode(201)
  @ApiOperation({ operationId: 'playMinRpsGame' })
  @API_201({ type: MinRpsPlayResultDto })
  @API_400()
  @API_409()
  @API_500()
  public play(@Body() dto: MinRpsPlayDto): MinRpsPlayResultDto {
    return this.singleplayerService.playGame(dto);
  }
}
