import { MinAdventCalendar } from '../models/domains/minadvent-calendar';
import { MinAdventDoor } from '../models/domains/minadvent-door';
import { MinAdventCalendarEntity } from '../models/entities/minadvent-calendar.entity';
import { MinAdventDoorEntity } from '../models/entities/minadvent-door.entity';
import { MinAdventDoorStatus } from '../models/enums/minadvent-door-status.enum';
import { MinAdventBlock } from '../models/domains/minadvent-block';
import { MinAdventBlockEntity } from '../models/entities/minadvent-block.entity';

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
        door.blocks = [...(entityDoor.blocks ?? [])]
          .sort((left, right) => left.position - right.position)
          .map((entityBlock) => {
            const block = new MinAdventBlock();
            block.description = entityBlock.description;
            block.position = entityBlock.position;
            block.text = entityBlock.text;
            block.title = entityBlock.title;
            block.type = entityBlock.type;
            block.url = entityBlock.url;
            return block;
          });
        return door;
      });
    domain.completed = MinAdventEntityMapper.isCompleted(domain);
    return domain;
  }

  public static toDoorEntity(domain: MinAdventDoor, calendarId: string): MinAdventDoorEntity {
    const entity = new MinAdventDoorEntity();
    entity.calendarId = calendarId;
    entity.day = domain.day;
    entity.status = domain.status;
    return entity;
  }

  public static toBlockEntities(blocks: MinAdventBlock[], doorId: string): MinAdventBlockEntity[] {
    return blocks.map((block) => Object.assign(new MinAdventBlockEntity(), { ...block, doorId }));
  }

  private static isCompleted(calendar: MinAdventCalendar): boolean {
    const dateParts = new Intl.DateTimeFormat('en', {
      timeZone: 'Europe/Berlin',
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
    }).formatToParts(new Date());
    const berlinDate = Object.fromEntries(dateParts.map((part) => [part.type, Number(part.value)]));
    const currentYear = berlinDate['year'];
    const currentMonth = berlinDate['month'];
    const currentDay = berlinDate['day'];
    const deadlinePassed =
      currentYear > calendar.year || (currentYear === calendar.year && currentMonth === 12 && currentDay >= 25);
    const hasOpenedDoor = calendar.doors.some((door) => door.status === MinAdventDoorStatus.Opened);
    const hasFilledDoor = calendar.doors.some((door) => door.status === MinAdventDoorStatus.Filled);

    return deadlinePassed && hasOpenedDoor && !hasFilledDoor;
  }
}
