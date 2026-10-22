import { MinAdventCalendar } from '../models/domains/minadvent-calendar';
import { MinAdventDoor } from '../models/domains/minadvent-door';
import { MinAdventCalendarCreateDto } from '../models/dtos/minadvent-calendar-create.dto';
import { MinAdventCalendarUpdateDto } from '../models/dtos/minadvent-calendar-update.dto';
import { MinAdventDoorStatus } from '../models/enums/minadvent-door-status.enum';

export class MinAdventDtoMapper {
  public static applyMetadataUpdate(dto: MinAdventCalendarUpdateDto, domain: MinAdventCalendar): MinAdventCalendar {
    return {
      ...domain,
      title: dto.title?.trim() ?? domain.title,
      recipient: dto.recipientName?.trim() ?? domain.recipient,
    };
  }

  public static toDomain(dto: MinAdventCalendarCreateDto, ownerId: string): MinAdventCalendar {
    const domain = new MinAdventCalendar();
    domain.ownerId = ownerId;
    domain.title = dto.title.trim();
    domain.recipient = dto.recipientName.trim();
    domain.year = dto.year;
    domain.doors = Array.from({ length: 24 }, (_, index) => {
      const door = new MinAdventDoor();
      door.day = index + 1;
      door.status = MinAdventDoorStatus.Empty;
      return door;
    });
    return domain;
  }
}
