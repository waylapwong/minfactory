import { AuthorizationGuard, Can } from '@nestjs/authorization';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  ParseUUIDPipe,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { User } from '../../../core/authentication/decorators/user.decorator';
import { FirebaseGuard } from '../../../core/authentication/guards/firebase.guard';
import { UserRolePolicy } from '../../../core/authorization/policies/user-role.policy';
import { API_200 } from '../../../shared/decorators/api-200.decorator';
import { API_201 } from '../../../shared/decorators/api-201.decorator';
import { API_204 } from '../../../shared/decorators/api-204.decorator';
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
import { MinAdventCalendarDeleteDto } from '../models/dtos/minadvent-calendar-delete.dto';
import { MinAdventCalendarUpdateDto } from '../models/dtos/minadvent-calendar-update.dto';
import { MinAdventCalendarDto } from '../models/dtos/minadvent-calendar.dto';
import { MinAdventDoorStatusUpdateDto } from '../models/dtos/minadvent-door-status-update.dto';
import { MinAdventDoorUpdateResponseDto } from '../models/dtos/minadvent-door-update-response.dto';
import { MinAdventDoorUpdateDto } from '../models/dtos/minadvent-door-update.dto';
import { MinAdventSharingResponseDto } from '../models/dtos/minadvent-sharing-response.dto';
import { MinAdventSharingUpdateDto } from '../models/dtos/minadvent-sharing-update.dto';
import { MinAdventTokenRotationDto } from '../models/dtos/minadvent-token-rotation.dto';
import { MinAdventCalendarService } from '../services/minadvent-calendar.service';

@Controller('minadvent/calendars')
@ApiTags(MinApp.MinAdvent)
@UseGuards(FirebaseGuard, MinFactoryUserGuard, AuthorizationGuard)
@Can(UserRolePolicy, 'isUser')
export class MinAdventCalendarController {
  constructor(private readonly calendarService: MinAdventCalendarService) {}

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ operationId: 'deleteMinAdventCalendar' })
  @API_PARAM_ID()
  @API_204()
  @API_400()
  @API_401()
  @API_403()
  @API_404()
  @API_409()
  @API_500()
  public async deleteMinAdventCalendar(
    @Body() dto: MinAdventCalendarDeleteDto,
    @Param('id', ParseUUIDPipe) id: string,
    @User() user: MinFactoryUser,
  ): Promise<void> {
    await this.calendarService.delete(user, id, dto);
  }

  @Get()
  @HttpCode(200)
  @ApiOperation({ operationId: 'getAllMinAdventCalendars' })
  @API_200({ type: MinAdventCalendarDto, isArray: true })
  @API_400()
  @API_401()
  @API_500()
  public async getAllMinAdventCalendars(@User() user: MinFactoryUser): Promise<MinAdventCalendarDto[]> {
    return await this.calendarService.list(user);
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
  public async getMinAdventCalendar(
    @Param('id', ParseUUIDPipe) id: string,
    @User() user: MinFactoryUser,
  ): Promise<MinAdventCalendarDto> {
    return await this.calendarService.get(user, id);
  }

  // TODO: Refactor
  @Get(':id/share')
  @HttpCode(200)
  @ApiOperation({ operationId: 'getMinAdventShare' })
  @API_PARAM_ID()
  @API_200({ type: MinAdventSharingResponseDto })
  @API_400()
  @API_401()
  @API_403()
  @API_404()
  @API_500()
  public async getShare(
    @User() user: MinFactoryUser,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<MinAdventSharingResponseDto> {
    return await this.calendarService.getSharing(user, id);
  }

  @Post()
  @HttpCode(201)
  @ApiOperation({ operationId: 'createMinAdventCalendar' })
  @API_201({ type: MinAdventCalendarDto })
  @API_400()
  @API_401()
  @API_500()
  public async createMinAdventCalendar(
    @Body() dto: MinAdventCalendarCreateDto,
    @User() user: MinFactoryUser,
  ): Promise<MinAdventCalendarDto> {
    return await this.calendarService.create(user, dto);
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
  public async updateMinAdventCalendar(
    @Body() dto: MinAdventCalendarUpdateDto,
    @Param('id', ParseUUIDPipe) id: string,
    @User() user: MinFactoryUser,
  ): Promise<MinAdventCalendarDto> {
    return await this.calendarService.update(user, id, dto);
  }

  @Put(':id/doors/:day')
  @HttpCode(200)
  @ApiOperation({ operationId: 'updateMinAdventDoor' })
  @API_PARAM_ID()
  @API_200({ type: MinAdventDoorUpdateResponseDto })
  @API_400()
  @API_401()
  @API_403()
  @API_404()
  @API_409()
  @API_500()
  public async updateMinAdventDoor(
    @Body() dto: MinAdventDoorUpdateDto,
    @Param('day', ParseIntPipe) day: number,
    @Param('id', ParseUUIDPipe) id: string,
    @User() user: MinFactoryUser,
  ): Promise<MinAdventDoorUpdateResponseDto> {
    return await this.calendarService.updateDoor(user, id, day, dto);
  }

  @Put(':id/doors/:day/status')
  @HttpCode(200)
  @ApiOperation({ operationId: 'updateMinAdventDoorStatus' })
  @API_PARAM_ID()
  @API_200({ type: MinAdventDoorUpdateResponseDto })
  @API_400()
  @API_401()
  @API_403()
  @API_404()
  @API_409()
  @API_500()
  public async updateMinAdventDoorStatus(
    @Body() dto: MinAdventDoorStatusUpdateDto,
    @Param('day', ParseIntPipe) day: number,
    @Param('id', ParseUUIDPipe) id: string,
    @User() user: MinFactoryUser,
  ): Promise<MinAdventDoorUpdateResponseDto> {
    return await this.calendarService.updateDoorStatus(user, id, day, dto);
  }

  // TODO: Refactor
  @Put(':id/share')
  @HttpCode(200)
  @ApiOperation({ operationId: 'updateMinAdventShare' })
  @API_PARAM_ID()
  @API_200({ type: MinAdventSharingResponseDto })
  @API_400()
  @API_401()
  @API_403()
  @API_404()
  @API_409()
  @API_500()
  public async updateShare(
    @User() user: MinFactoryUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() input: MinAdventSharingUpdateDto,
  ): Promise<MinAdventSharingResponseDto> {
    return await this.calendarService.updateSharing(user, id, input);
  }

  @Put(':id/sharing/token')
  @HttpCode(200)
  @ApiOperation({ operationId: 'updateMinAdventSharingToken' })
  @API_PARAM_ID()
  @API_200({ type: MinAdventSharingResponseDto })
  @API_400()
  @API_401()
  @API_403()
  @API_404()
  @API_409()
  @API_500()
  public async updateSharingToken(
    @User() user: MinFactoryUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() input: MinAdventTokenRotationDto,
  ): Promise<MinAdventSharingResponseDto> {
    return await this.calendarService.rotateSharingToken(user, id, input);
  }
}
