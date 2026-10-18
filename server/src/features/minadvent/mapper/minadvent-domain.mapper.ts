import { MinAdventCalendar } from '../models/domains/minadvent-calendar';
import { MinAdventCalendarDto } from '../models/dtos/minadvent-calendar.dto';
import { MinAdventDoorDto } from '../models/dtos/minadvent-door.dto';
import { MinAdventCalendarEntity } from '../models/entities/minadvent-calendar.entity';
import { MinAdventDoorEntity } from '../models/entities/minadvent-door.entity';

export class MinAdventDomainMapper {
  public static toDoorEntities(domain: MinAdventCalendar, calendarId: string): MinAdventDoorEntity[] {
    return domain.doors.map((door) => {
      const entity = new MinAdventDoorEntity();
      entity.calendarId = calendarId;
      entity.day = door.day;
      entity.status = door.status;
      return entity;
    });
  }

  public static toDto(domain: MinAdventCalendar): MinAdventCalendarDto {
    const dto = new MinAdventCalendarDto();
    dto.id = domain.id;
    dto.title = domain.title;
    dto.recipientName = domain.recipientName;
    dto.year = domain.year;
    dto.version = domain.version;
    dto.published = domain.isPublished;
    dto.completed = domain.completed;
    dto.doors = domain.doors.map((door) => {
      const doorDto = new MinAdventDoorDto();
      doorDto.day = door.day;
      doorDto.status = door.status;
      return doorDto;
    });
    return dto;
  }

  public static toEntity(domain: MinAdventCalendar): MinAdventCalendarEntity {
    const entity = new MinAdventCalendarEntity();
    if (domain.id) {
      entity.id = domain.id;
    }
    entity.ownerId = domain.ownerId;
    entity.year = domain.year;
    entity.title = domain.title;
    entity.recipientName = domain.recipientName;
    entity.version = domain.version;
    entity.isPublished = domain.isPublished;
    entity.activeToken = domain.activeToken;
    entity.createdAt = domain.createdAt;
    entity.updatedAt = domain.updatedAt;
    return entity;
  }
}
