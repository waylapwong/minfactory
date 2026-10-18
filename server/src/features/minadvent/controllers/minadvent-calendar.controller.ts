import { AuthorizationGuard, Can } from '@nestjs/authorization';
import { Body, Controller, Get, HttpCode, Param, ParseUUIDPipe, Post, Put, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { User } from '../../../core/authentication/decorators/user.decorator';
import { FirebaseGuard } from '../../../core/authentication/guards/firebase.guard';
import { UserRolePolicy } from '../../../core/authorization/policies/user-role.policy';
import { API_200 } from '../../../shared/decorators/api-200.decorator';
import { API_201 } from '../../../shared/decorators/api-201.decorator';
import { API_400 } from '../../../shared/decorators/api-400.decorator';
import { API_401 } from '../../../shared/decorators/api-401.decorator';
import { API_403 } from '../../../shared/decorators/api-403.decorator';
import { API_404 } from '../../../shared/decorators/api-404.decorator';
import { API_409 } from '../../../shared/decorators/api-409.decorator';
import { API_500 } from '../../../shared/decorators/api-500.decorator';
import { API_PARAM_ID } from '../../../shared/decorators/api-param-id.decorator';
import { MinApp } from '../../../shared/enums/minapp.enum';
import { MinFactoryUserGuard } from '../../minfactory/guards/minfactory-user.guard';
import { MinFactoryUser } from '../../minfactory/models/domains/minfactory-user';
import { MinAdventCalendarCreateDto } from '../models/dtos/minadvent-calendar-create.dto';
import { MinAdventCalendarUpdateDto } from '../models/dtos/minadvent-calendar-update.dto';
import { MinAdventCalendarDto } from '../models/dtos/minadvent-calendar.dto';
import { MinAdventCalendarService } from '../services/minadvent-calendar.service';

@Controller('minadvent/calendars')
@ApiTags(MinApp.MinAdvent)
@UseGuards(FirebaseGuard, MinFactoryUserGuard, AuthorizationGuard)
@Can(UserRolePolicy, 'isUser')
export class MinAdventCalendarController {
  constructor(private readonly calendarService: MinAdventCalendarService) {}

  @Get()
  @HttpCode(200)
  @ApiOperation({ operationId: 'getMinAdventCalendars' })
  @API_200({ type: MinAdventCalendarDto, isArray: true })
  @API_400()
  @API_401()
  @API_500()
  public list(@User() user: MinFactoryUser): Promise<MinAdventCalendarDto[]> {
    return this.calendarService.list(user);
  }

  @Get(':id')
  @HttpCode(200)
  @ApiOperation({ operationId: 'getMinAdventCalendar' })
  @API_PARAM_ID()
  @API_200({ type: MinAdventCalendarDto })
  @API_400()
  @API_401()
  @API_403()
  @API_404()
  @API_500()
  public get(@User() user: MinFactoryUser, @Param('id', ParseUUIDPipe) id: string): Promise<MinAdventCalendarDto> {
    return this.calendarService.get(user, id);
  }

  @Post()
  @HttpCode(201)
  @ApiOperation({ operationId: 'createMinAdventCalendar' })
  @API_201({ type: MinAdventCalendarDto })
  @API_400()
  @API_401()
  @API_500()
  public create(
    @User() user: MinFactoryUser,
    @Body() input: MinAdventCalendarCreateDto,
  ): Promise<MinAdventCalendarDto> {
    return this.calendarService.create(user, input);
  }

  @Put(':id')
  @HttpCode(200)
  @ApiOperation({ operationId: 'updateMinAdventCalendar' })
  @API_PARAM_ID()
  @API_200({ type: MinAdventCalendarDto })
  @API_400()
  @API_401()
  @API_403()
  @API_404()
  @API_409()
  @API_500()
  public update(
    @User() user: MinFactoryUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() input: MinAdventCalendarUpdateDto,
  ): Promise<MinAdventCalendarDto> {
    return this.calendarService.update(user, id, input);
  }
}
