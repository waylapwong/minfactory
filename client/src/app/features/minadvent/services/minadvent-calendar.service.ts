import { Injectable, Signal, WritableSignal, computed, signal } from '@angular/core';
import { MinAdventCalendarCreateDto } from '../../../core/generated/model/min-advent-calendar-create-dto';
import { MinAdventCalendarUpdateDto } from '../../../core/generated/model/min-advent-calendar-update-dto';
import { MinAdventDomainMapper } from '../mapper/minadvent-domain.mapper';
import { MinAdventCalendar } from '../models/minadvent-calendar.model';
import { MinAdventCalendarRepository } from '../repositories/minadvent-calendar.repository';

@Injectable({ providedIn: 'root' })
export class MinAdventCalendarService {
  private readonly cachedCalendars: WritableSignal<MinAdventCalendar[]> = signal([]);
  public readonly calendars: Signal<MinAdventCalendar[]> = computed(() => this.cachedCalendars());

  constructor(private readonly repository: MinAdventCalendarRepository) {}

  public async loadCalendars(): Promise<void> {
    const dtos = await this.repository.getAll();
    this.cachedCalendars.set(dtos.map(MinAdventDomainMapper.toCalendar));
  }

  public async getCalendar(id: string): Promise<MinAdventCalendar> {
    return MinAdventDomainMapper.toCalendar(await this.repository.get(id));
  }

  public async createCalendar(input: MinAdventCalendarCreateDto): Promise<MinAdventCalendar> {
    const calendar = MinAdventDomainMapper.toCalendar(await this.repository.create(input));
    this.cachedCalendars.update((calendars) => [calendar, ...calendars]);
    return calendar;
  }

  public async updateCalendar(id: string, input: MinAdventCalendarUpdateDto): Promise<MinAdventCalendar> {
    const calendar = MinAdventDomainMapper.toCalendar(await this.repository.update(id, input));
    this.cachedCalendars.update((calendars) => calendars.map((item) => (item.id === id ? calendar : item)));
    return calendar;
  }
}