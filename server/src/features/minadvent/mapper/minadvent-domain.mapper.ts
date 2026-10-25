import { MinAdventCalendar } from '../models/domains/minadvent-calendar';
import { MinAdventDoor } from '../models/domains/minadvent-door';
import { MinAdventCalendarDto } from '../models/dtos/minadvent-calendar.dto';
import { MinAdventDoorDto } from '../models/dtos/minadvent-door.dto';
import { MinAdventBlockEntity } from '../models/entities/minadvent-block.entity';
import { MinAdventCalendarEntity } from '../models/entities/minadvent-calendar.entity';
import { MinAdventDoorEntity } from '../models/entities/minadvent-door.entity';
import { MinAdventBlockDto } from '../models/dtos/minadvent-block.dto';
import { MinAdventDoorUpdateResponseDto } from '../models/dtos/minadvent-door-update-response.dto';
import { MinAdventBlock } from '../models/domains/minadvent-block';

export class MinAdventDomainMapper {
  public static toDoorEntities(domain: MinAdventCalendar, calendarId: string): MinAdventDoorEntity[] {
    return domain.doors.map((door) => {
      const entity: MinAdventDoorEntity = new MinAdventDoorEntity();
      entity.calendarId = calendarId;
      entity.day = door.day;
      entity.status = door.status;
      entity.blocks = MinAdventDomainMapper.toBlockEntities(door.blocks);
      return entity;
    });
  }

  public static toBlockEntities(domain: MinAdventBlock[]): MinAdventBlockEntity[] {
    return domain.map((block) =>
      Object.assign(new MinAdventBlockEntity(), {
        description: block.description,
        position: block.position,
        text: block.text,
        title: block.title,
        type: block.type,
        url: block.url,
      }),
    );
  }

  public static toDto(domain: MinAdventCalendar): MinAdventCalendarDto {
    const dto: MinAdventCalendarDto = new MinAdventCalendarDto();
    dto.id = domain.id;
    dto.title = domain.title;
    dto.recipientName = domain.recipientName;
    dto.year = domain.year;
    dto.version = domain.version;
    dto.published = domain.isPublished;
    dto.completed = domain.completed;
    dto.doors = domain.doors.map((door) => {
      const doorDto: MinAdventDoorDto = new MinAdventDoorDto();
      doorDto.day = door.day;
      doorDto.status = door.status;
      doorDto.blocks = door.blocks.map((block) => MinAdventDomainMapper.toBlockDto(block));
      return doorDto;
    });
    return dto;
  }

  public static toBlockDto(domain: MinAdventBlock): MinAdventBlockDto {
    return {
      description: domain.description,
      position: domain.position,
      text: domain.text,
      title: domain.title,
      type: domain.type,
      url: domain.url,
    };
  }

  public static toDoorUpdateResponse(day: MinAdventDoor, calendar: MinAdventCalendar): MinAdventDoorUpdateResponseDto {
    const dto: MinAdventDoorUpdateResponseDto = new MinAdventDoorUpdateResponseDto();
    dto.day = day.day;
    dto.status = day.status;
    dto.version = calendar.version;
    dto.completed = calendar.completed;
    return dto;
  }

  public static toEntity(domain: MinAdventCalendar): MinAdventCalendarEntity {
    const entity: MinAdventCalendarEntity = new MinAdventCalendarEntity();
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
    entity.doors = MinAdventDomainMapper.toDoorEntities(domain, domain.id);
    return entity;
  }
}
