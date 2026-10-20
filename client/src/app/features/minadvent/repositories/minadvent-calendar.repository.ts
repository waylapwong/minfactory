import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { MinAdventApiService } from '../../../core/generated';
import { MinAdventCalendarCreateDto } from '../../../core/generated/model/min-advent-calendar-create-dto';
import { MinAdventCalendarUpdateDto } from '../../../core/generated/model/min-advent-calendar-update-dto';
import { MinAdventDoorUpdateDto } from '../../../core/generated/model/min-advent-door-update-dto';
import { MinAdventSharingResponseDto } from '../../../core/generated/model/min-advent-sharing-response-dto';
import { MinAdventSharingUpdateDto } from '../../../core/generated/model/min-advent-sharing-update-dto';
import { MinAdventTokenRotationDto } from '../../../core/generated/model/min-advent-token-rotation-dto';
import { MinAdventSharedCalendarDto } from '../../../core/generated/model/min-advent-shared-calendar-dto';
import { MinAdventSharedDoorContentDto } from '../../../core/generated/model/min-advent-shared-door-content-dto';
import { MinAdventSharedDoorOpenResponseDto } from '../../../core/generated/model/min-advent-shared-door-open-response-dto';

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

  public openSharedDoor(
    token: string,
    day: number,
    expectedVersion: number,
  ): Promise<MinAdventSharedDoorOpenResponseDto> {
    return firstValueFrom(this.api.openMinAdventSharedDoor(token, day, { expectedVersion }));
  }

  public update(id: string, input: MinAdventCalendarUpdateDto) {
    return firstValueFrom(this.api.updateMinAdventCalendar(id, input));
  }

  public updateDoor(id: string, day: number, input: MinAdventDoorUpdateDto) {
    return firstValueFrom(this.api.updateMinAdventDoor(id, day, input));
  }

  public getSharing(id: string): Promise<MinAdventSharingResponseDto> {
    return firstValueFrom(this.api.getMinAdventSharing(id));
  }

  public updateSharing(id: string, input: MinAdventSharingUpdateDto): Promise<MinAdventSharingResponseDto> {
    return firstValueFrom(this.api.updateMinAdventSharing(id, input));
  }

  public rotateSharingToken(id: string, input: MinAdventTokenRotationDto): Promise<MinAdventSharingResponseDto> {
    return firstValueFrom(this.api.rotateMinAdventSharingToken(id, input));
  }
}
