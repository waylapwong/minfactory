import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { MinRpsMatchRequestDto } from '../models/dtos/minrps-match-request.dto';
import { MinRpsMatchResponseDto } from '../models/dtos/minrps-match-response.dto';
import { API_201 } from 'src/shared/decorators/api-201.decorator';
import { API_400 } from 'src/shared/decorators/api-400.decorator';
import { API_500 } from 'src/shared/decorators/api-500.decorator';
import { MinApp } from 'src/shared/enums/minapp.enum';

@Controller('minrps/matches')
@ApiTags(MinApp.MinRpsMatch)
export class MinRpsMatchController {
  @Post()
  @ApiOperation({ operationId: 'create' })
  @API_201({ type: MinRpsMatchResponseDto })
  @API_400()
  @API_500()
  public async create(@Body() dto: MinRpsMatchRequestDto): Promise<MinRpsMatchResponseDto> {
    return new MinRpsMatchResponseDto();
  }
}
