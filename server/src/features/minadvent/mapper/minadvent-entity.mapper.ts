import { MinAdventCalendar } from '../models/domains/minadvent-calendar';
import { MinAdventDoor } from '../models/domains/minadvent-door';
import { MinAdventCalendarEntity } from '../models/entities/minadvent-calendar.entity';
import { MinAdventDoorEntity } from '../models/entities/minadvent-door.entity';

export class MinAdventEntityMapper {
  public static toDomain(entity: MinAdventCalendarEntity): MinAdventCalendar {
    const domain = new MinAdventCalendar();
    domain.id = entity.id;
    domain.ownerId = entity.ownerId;
    domain.year = entity.year;
    domain.title = entity.title;
    domain.recipientName = entity.recipientName;
    domain.version = entity.version;
    domain.isPublished = entity.isPublished;
    domain.activeToken = entity.activeToken;
    domain.createdAt = entity.createdAt;
    domain.updatedAt = entity.updatedAt;
    domain.doors = [...(entity.doors ?? [])]
      .sort((left, right) => left.day - right.day)
      .map((entityDoor) => {
        const door = new MinAdventDoor();
        door.day = entityDoor.day;
        door.status = entityDoor.status;
        return door;
      });
    return domain;
  }

  public static toDoorEntity(domain: MinAdventDoor, calendarId: string): MinAdventDoorEntity {
    const entity = new MinAdventDoorEntity();
    entity.calendarId = calendarId;
    entity.day = domain.day;
    entity.status = domain.status;
    return entity;
  }
}
