import { Body, Controller, Headers, HttpCode, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { LoggerService } from '../../../core/logger/logger.service';
import { API_201 } from '../../../shared/decorators/api-201.decorator';
import { API_400 } from '../../../shared/decorators/api-400.decorator';
import { API_409 } from '../../../shared/decorators/api-409.decorator';
import { API_500 } from '../../../shared/decorators/api-500.decorator';
import { API_HEADER_REQUEST_ID } from '../../../shared/decorators/api-request-id.decorator';
import { MinApp } from '../../../shared/enums/minapp.enum';
import { MinRpsPlayResultDto } from '../models/dtos/minrps-play-result.dto';
import { MinRpsPlayDto } from '../models/dtos/minrps-play.dto';
import { MinRpsSingleplayerService } from '../services/minrps-singleplayer.service';

@Controller('minrps')
@ApiTags(MinApp.MinRps)
export class MinRpsSingleplayerController {
  private readonly logger: LoggerService = new LoggerService(MinRpsSingleplayerController.name);

  constructor(private readonly singleplayerService: MinRpsSingleplayerService) {}

  @Post('play')
  @HttpCode(201)
  @ApiOperation({ operationId: 'playMinRpsGame' })
  @API_HEADER_REQUEST_ID()
  @API_201({ type: MinRpsPlayResultDto })
  @API_400()
  @API_409()
  @API_500()
  public play(@Body() dto: MinRpsPlayDto, @Headers('X-Request-Id') requestId: string): MinRpsPlayResultDto {
    this.logger.log(`Incoming request POST /minrps/play`, requestId);
    return this.singleplayerService.playGame(dto);
  }
}
