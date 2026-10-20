import { Injectable, Signal, WritableSignal, computed, signal } from '@angular/core';
import { MinAdventCalendarCreateDto } from '../../../core/generated/model/min-advent-calendar-create-dto';
import { MinAdventCalendarUpdateDto } from '../../../core/generated/model/min-advent-calendar-update-dto';
import { MinAdventDoorUpdateDto } from '../../../core/generated/model/min-advent-door-update-dto';
import { MinAdventDoorUpdateResponseDto } from '../../../core/generated/model/min-advent-door-update-response-dto';
import { MinAdventSharingResponseDto } from '../../../core/generated/model/min-advent-sharing-response-dto';
import { MinAdventSharedCalendarDto } from '../../../core/generated/model/min-advent-shared-calendar-dto';
import { MinAdventDomainMapper } from '../mapper/minadvent-domain.mapper';
import { MinAdventCalendar } from '../models/minadvent-calendar.model';
import { MinAdventCalendarRepository } from '../repositories/minadvent-calendar.repository';
import { MinAdventSharedDoorContentDto } from '../../../core/generated/model/min-advent-shared-door-content-dto';
import { MinAdventSharedDoorOpenResponseDto } from '../../../core/generated/model/min-advent-shared-door-open-response-dto';

@Injectable({ providedIn: 'root' })
export class MinAdventCalendarService {
  public readonly calendars: Signal<MinAdventCalendar[]> = computed(() => this.cachedCalendars());

  private readonly cachedCalendars: WritableSignal<MinAdventCalendar[]> = signal([]);

  constructor(private readonly repository: MinAdventCalendarRepository) {}

  public async createCalendar(input: MinAdventCalendarCreateDto): Promise<MinAdventCalendar> {
    const calendar = MinAdventDomainMapper.toCalendar(await this.repository.create(input));
    this.cachedCalendars.update((calendars) => [calendar, ...calendars]);
    return calendar;
  }

  public async getCalendar(id: string): Promise<MinAdventCalendar> {
    return MinAdventDomainMapper.toCalendar(await this.repository.get(id));
  }

  public getSharedCalendar(token: string): Promise<MinAdventSharedCalendarDto> {
    return this.repository.getSharedCalendar(token);
  }

  public getSharedDoor(token: string, day: number): Promise<MinAdventSharedDoorContentDto> {
    return this.repository.getSharedDoor(token, day);
  }

  public openSharedDoor(
    token: string,
    day: number,
    expectedVersion: number,
  ): Promise<MinAdventSharedDoorOpenResponseDto> {
    return this.repository.openSharedDoor(token, day, expectedVersion);
  }

  public async loadCalendars(): Promise<void> {
    const dtos = await this.repository.getAll();
    this.cachedCalendars.set(dtos.map(MinAdventDomainMapper.toCalendar));
  }

  public async updateCalendar(id: string, input: MinAdventCalendarUpdateDto): Promise<MinAdventCalendar> {
    const calendar = MinAdventDomainMapper.toCalendar(await this.repository.update(id, input));
    this.cachedCalendars.update((calendars) => calendars.map((item) => (item.id === id ? calendar : item)));
    return calendar;
  }

  public async updateDoor(
    id: string,
    day: number,
    input: MinAdventDoorUpdateDto,
  ): Promise<MinAdventDoorUpdateResponseDto> {
    const result = await this.repository.updateDoor(id, day, input);
    this.cachedCalendars.update((calendars) =>
      calendars.map((calendar) =>
        calendar.id !== id
          ? calendar
          : {
              ...calendar,
              completed: result.completed,
              doors: calendar.doors.map((door) =>
                door.day === result.day
                  ? { ...door, blocks: input.blocks.map((block) => ({ ...block })), status: result.status }
                  : door,
              ),
              version: result.version,
            },
      ),
    );
    return result;
  }

  public getSharing(id: string): Promise<MinAdventSharingResponseDto> {
    return this.repository.getSharing(id);
  }

  public async updateSharing(
    id: string,
    published: boolean,
    expectedVersion: number,
  ): Promise<MinAdventSharingResponseDto> {
    const response = await this.repository.updateSharing(id, { published, expectedVersion });
    this.updateCachedSharing(id, response);
    return response;
  }

  public async rotateSharingToken(id: string, expectedVersion: number): Promise<MinAdventSharingResponseDto> {
    const response = await this.repository.rotateSharingToken(id, { expectedVersion });
    this.updateCachedSharing(id, response);
    return response;
  }

  private updateCachedSharing(id: string, response: MinAdventSharingResponseDto): void {
    this.cachedCalendars.update((calendars) =>
      calendars.map((calendar) =>
        calendar.id === id
          ? { ...calendar, completed: response.completed, published: response.published, version: response.version }
          : calendar,
      ),
    );
  }
}
