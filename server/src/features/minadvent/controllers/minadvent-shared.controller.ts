import {
  Body,
  Controller,
  Get,
  Header,
  HttpCode,
  NotFoundException,
  Param,
  ParseIntPipe,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { API_200 } from '../../../shared/decorators/api-200.decorator';
import { API_400 } from '../../../shared/decorators/api-400.decorator';
import { API_404 } from '../../../shared/decorators/api-404.decorator';
import { API_409 } from '../../../shared/decorators/api-409.decorator';
import { API_429 } from '../../../shared/decorators/api-429.decorator';
import { API_500 } from '../../../shared/decorators/api-500.decorator';
import { MinApp } from '../../../shared/enums/minapp.enum';
import { MinAdventSharedThrottlerGuard } from '../guards/minadvent-shared-throttler.guard';
import { MinAdventSharedCalendarDto } from '../models/dtos/minadvent-shared-calendar.dto';
import { MinAdventSharedDoorContentDto } from '../models/dtos/minadvent-shared-door-content.dto';
import { MinAdventSharedDoorOpenResponseDto } from '../models/dtos/minadvent-shared-door-open-response.dto';
import { MinAdventSharedDoorOpenDto } from '../models/dtos/minadvent-shared-door-open.dto';
import { MinAdventCalendarService } from '../services/minadvent-calendar.service';

@Controller('minadvent/shared')
@UseGuards(MinAdventSharedThrottlerGuard)
@ApiTags(MinApp.MinAdvent)
export class MinAdventSharedController {
  constructor(private readonly calendarService: MinAdventCalendarService) {}

  @Get(':token/doors/:day')
  @HttpCode(200)
  @Header('Cache-Control', 'no-store')
  @Header('Referrer-Policy', 'no-referrer')
  @ApiOperation({ operationId: 'getMinAdventSharedDoor' })
  @API_200({ type: MinAdventSharedDoorContentDto })
  @API_400()
  @API_404()
  @API_409()
  @API_429()
  @API_500()
  public async getMinAdventSharedDoor(
    @Param('day', ParseIntPipe) day: number,
    @Param('token') token: string,
  ): Promise<MinAdventSharedDoorContentDto> {
    const door: MinAdventSharedDoorContentDto | null = await this.calendarService.getSharedDoor(token, day);
    if (!door) {
      throw new NotFoundException({
        code: 'SHARED_CALENDAR_UNAVAILABLE',
        message: 'Dieser Adventskalender ist nicht verfügbar.',
      });
    }
    return door;
  }

  @Get(':token')
  @HttpCode(200)
  @Header('Cache-Control', 'no-store')
  @Header('Referrer-Policy', 'no-referrer')
  @ApiOperation({ operationId: 'getMinAdventSharedCalendar' })
  @API_200({ type: MinAdventSharedCalendarDto })
  @API_404()
  @API_429()
  @API_500()
  public async getMinAdventSharedCalendar(@Param('token') token: string): Promise<MinAdventSharedCalendarDto> {
    const calendar: MinAdventSharedCalendarDto | null = await this.calendarService.getSharedCalendar(token);
    if (!calendar) {
      throw new NotFoundException({
        code: 'SHARED_CALENDAR_UNAVAILABLE',
        message: 'Dieser Adventskalender ist nicht verfügbar.',
      });
    }
    return calendar;
  }

  @Put(':token/doors/:day')
  @HttpCode(200)
  @Header('Cache-Control', 'no-store')
  @Header('Referrer-Policy', 'no-referrer')
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @ApiOperation({ operationId: 'openMinAdventSharedDoor' })
  @API_200({ type: MinAdventSharedDoorOpenResponseDto })
  @API_400()
  @API_429()
  @API_404()
  @API_409()
  @API_500()
  public async openDoor(
    @Body() dto: MinAdventSharedDoorOpenDto,
    @Param('day', ParseIntPipe) day: number,
    @Param('token') token: string,
  ): Promise<MinAdventSharedDoorOpenResponseDto> {
    const door: MinAdventSharedDoorOpenResponseDto | null = await this.calendarService.openSharedDoor(token, day, dto);
    if (!door) {
      throw new NotFoundException({
        code: 'SHARED_CALENDAR_UNAVAILABLE',
        message: 'Dieser Adventskalender ist nicht verfügbar.',
      });
    }
    return door;
  }
}
