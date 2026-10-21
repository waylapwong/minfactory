import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { MinAdventApiService } from '../../../core/generated';
import { MinAdventCalendarCreateDto } from '../../../core/generated/model/min-advent-calendar-create-dto';
import { MinAdventCalendarUpdateDto } from '../../../core/generated/model/min-advent-calendar-update-dto';
import { MinAdventDoorUpdateDto } from '../../../core/generated/model/min-advent-door-update-dto';
import { MinAdventDoorUpdateResponseDto } from '../../../core/generated/model/min-advent-door-update-response-dto';
import { MinAdventSharedCalendarDto } from '../../../core/generated/model/min-advent-shared-calendar-dto';
import { MinAdventSharedDoorContentDto } from '../../../core/generated/model/min-advent-shared-door-content-dto';
import { MinAdventSharedDoorOpenResponseDto } from '../../../core/generated/model/min-advent-shared-door-open-response-dto';
import { MinAdventSharingResponseDto } from '../../../core/generated/model/min-advent-sharing-response-dto';
import { MinAdventSharingUpdateDto } from '../../../core/generated/model/min-advent-sharing-update-dto';
import { MinAdventTokenRotationDto } from '../../../core/generated/model/min-advent-token-rotation-dto';

@Injectable({ providedIn: 'root' })
export class MinAdventCalendarRepository {
  constructor(private readonly api: MinAdventApiService) {}

  public create(input: MinAdventCalendarCreateDto) {
    return firstValueFrom(this.api.createMinAdventCalendar(input));
  }

  public get(id: string) {
    return firstValueFrom(this.api.getMinAdventCalendar(id));
  }

  public getAll() {
    return firstValueFrom(this.api.getMinAdventCalendars());
  }

  public getSharedCalendar(token: string): Promise<MinAdventSharedCalendarDto> {
    return firstValueFrom(this.api.getMinAdventSharedCalendar(token));
  }

  public getSharedDoor(token: string, day: number): Promise<MinAdventSharedDoorContentDto> {
    return firstValueFrom(this.api.getMinAdventSharedDoor(token, day));
  }

  public getSharing(id: string): Promise<MinAdventSharingResponseDto> {
    return firstValueFrom(this.api.getMinAdventSharing(id));
  }

  public openSharedDoor(
    token: string,
    day: number,
    expectedVersion: number,
  ): Promise<MinAdventSharedDoorOpenResponseDto> {
    return firstValueFrom(this.api.openMinAdventSharedDoor(token, day, { expectedVersion }));
  }

  public rotateSharingToken(id: string, input: MinAdventTokenRotationDto): Promise<MinAdventSharingResponseDto> {
    return firstValueFrom(this.api.rotateMinAdventSharingToken(id, input));
  }

  public update(id: string, input: MinAdventCalendarUpdateDto) {
    return firstValueFrom(this.api.updateMinAdventCalendar(id, input));
  }

  public updateDoor(id: string, day: number, input: MinAdventDoorUpdateDto) {
    return firstValueFrom(this.api.updateMinAdventDoor(id, day, input));
  }

  public updateDoorStatus(id: string, day: number, expectedVersion: number): Promise<MinAdventDoorUpdateResponseDto> {
    return firstValueFrom(this.api.updateMinAdventDoorStatus(id, day, { status: 'FILLED', expectedVersion }));
  }

  public updateSharing(id: string, input: MinAdventSharingUpdateDto): Promise<MinAdventSharingResponseDto> {
    return firstValueFrom(this.api.updateMinAdventSharing(id, input));
  }
}
