import { Controller, Get, Header, HttpCode, NotFoundException, Param } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { API_200 } from '../../../shared/decorators/api-200.decorator';
import { API_404 } from '../../../shared/decorators/api-404.decorator';
import { API_500 } from '../../../shared/decorators/api-500.decorator';
import { MinApp } from '../../../shared/enums/minapp.enum';
import { MinAdventSharedCalendarDto } from '../models/dtos/minadvent-shared-calendar.dto';
import { MinAdventCalendarService } from '../services/minadvent-calendar.service';

@Controller('minadvent/shared')
@ApiTags(MinApp.MinAdvent)
export class MinAdventSharedController {
  constructor(private readonly calendarService: MinAdventCalendarService) {}

  @Get(':token')
  @HttpCode(200)
  @Header('Cache-Control', 'no-store')
  @Header('Referrer-Policy', 'no-referrer')
  @ApiOperation({ operationId: 'getMinAdventSharedCalendar' })
  @API_200({ type: MinAdventSharedCalendarDto })
  @API_404()
  @API_500()
  public async get(@Param('token') token: string): Promise<MinAdventSharedCalendarDto> {
    const calendar = await this.calendarService.getSharedCalendar(token);
    if (!calendar) {
      throw new NotFoundException({
        code: 'SHARED_CALENDAR_UNAVAILABLE',
        message: 'Dieser Adventskalender ist nicht verfÃ¼gbar.',
      });
    }
    return calendar;
  }
}
