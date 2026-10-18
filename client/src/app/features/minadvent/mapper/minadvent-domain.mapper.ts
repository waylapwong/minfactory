import { MinAdventCalendarDto } from '../../../core/generated';
import { MinAdventCalendar } from '../models/minadvent-calendar.model';

export class MinAdventDomainMapper {
  public static toCalendar(dto: MinAdventCalendarDto): MinAdventCalendar {
    return {
      id: dto.id,
      title: dto.title,
      recipientName: dto.recipientName,
      year: dto.year,
      version: dto.version,
      published: dto.published,
      completed: dto.completed,
      doors: dto.doors.map((door) => ({ day: door.day, status: door.status })),
    };
  }
}