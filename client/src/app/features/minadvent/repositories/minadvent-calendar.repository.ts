import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { MinAdventApiService } from '../../../core/generated';
import { MinAdventCalendarCreateDto } from '../../../core/generated/model/min-advent-calendar-create-dto';
import { MinAdventCalendarUpdateDto } from '../../../core/generated/model/min-advent-calendar-update-dto';

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

  public update(id: string, input: MinAdventCalendarUpdateDto) {
    return firstValueFrom(this.api.updateMinAdventCalendar(id, input));
  }
}
