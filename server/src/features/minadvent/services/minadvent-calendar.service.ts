import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { MinFactoryUser } from '../../minfactory/models/domains/minfactory-user';
import { MinAdventDomainMapper } from '../mapper/minadvent-domain.mapper';
import { MinAdventDtoMapper } from '../mapper/minadvent-dto.mapper';
import { MinAdventEntityMapper } from '../mapper/minadvent-entity.mapper';
import { MinAdventCalendar } from '../models/domains/minadvent-calendar';
import { MinAdventCalendarDto } from '../models/dtos/minadvent-calendar.dto';
import { MinAdventCalendarCreateDto } from '../models/dtos/minadvent-calendar-create.dto';
import { MinAdventCalendarUpdateDto } from '../models/dtos/minadvent-calendar-update.dto';
import { MinAdventCalendarEntity } from '../models/entities/minadvent-calendar.entity';
import { MinAdventCalendarRepository } from '../repositories/minadvent-calendar.repository';

@Injectable()
export class MinAdventCalendarService {
  constructor(private readonly calendarRepository: MinAdventCalendarRepository) {}

  public async create(user: MinFactoryUser, input: MinAdventCalendarCreateDto): Promise<MinAdventCalendarDto> {
    this.validateCreate(input);
    const domain = MinAdventDtoMapper.toDomain(input, user.id);
    return MinAdventDomainMapper.toDto(MinAdventEntityMapper.toDomain(await this.calendarRepository.create(domain)));
  }

  public async list(user: MinFactoryUser): Promise<MinAdventCalendarDto[]> {
    const calendars = (await this.calendarRepository.findByOwner(user.id)).map(MinAdventEntityMapper.toDomain);
    const currentYear = this.getCurrentBerlinYear();
    calendars.sort((left, right) => {
      if (left.year === currentYear) {
        return right.year === currentYear ? 0 : -1;
      }
      if (right.year === currentYear) {
        return 1;
      }
      return right.year - left.year || right.createdAt.getTime() - left.createdAt.getTime();
    });
    return calendars.map(MinAdventDomainMapper.toDto);
  }

  public async get(user: MinFactoryUser, id: string): Promise<MinAdventCalendarDto> {
    return MinAdventDomainMapper.toDto(await this.requireOwnedCalendar(user, id));
  }

  public async update(
    user: MinFactoryUser,
    id: string,
    input: MinAdventCalendarUpdateDto,
  ): Promise<MinAdventCalendarDto> {
    if (input.expectedVersion === undefined || (!input.title && !input.recipientName)) {
      throw new BadRequestException('At least one of title or recipientName is required.');
    }
    if (input.title !== undefined && !input.title.trim()) {
      throw new BadRequestException('Title must contain 1 to 100 characters.');
    }
    if (input.recipientName !== undefined && !input.recipientName.trim()) {
      throw new BadRequestException('Recipient name must contain 1 to 100 characters.');
    }
    const calendar = await this.requireOwnedCalendar(user, id);
    if (input.expectedVersion !== calendar.version) {
      throw new ConflictException({
        code: 'VERSION_CONFLICT',
        message: 'Der Kalender wurde zwischenzeitlich geändert.',
      });
    }
    const updatedDomain = MinAdventDtoMapper.applyMetadataUpdate(input, calendar);
    if (updatedDomain.title === calendar.title && updatedDomain.recipientName === calendar.recipientName) {
      return MinAdventDomainMapper.toDto(calendar);
    }
    updatedDomain.version += 1;
    const updated = await this.calendarRepository.update(updatedDomain, input.expectedVersion);
    return MinAdventDomainMapper.toDto(MinAdventEntityMapper.toDomain(updated));
  }

  private validateCreate(input: MinAdventCalendarCreateDto): void {
    if (!input.title?.trim() || input.title.length > 100) {
      throw new BadRequestException('Title must contain 1 to 100 characters.');
    }
    if (!input.recipientName?.trim() || input.recipientName.length > 100) {
      throw new BadRequestException('Recipient name must contain 1 to 100 characters.');
    }
    if (!Number.isInteger(input.year) || input.year < 1 || input.year > 9999) {
      throw new BadRequestException('Year must be an integer between 1 and 9999.');
    }
  }

  private async requireOwnedCalendar(user: MinFactoryUser, id: string): Promise<MinAdventCalendar> {
    const calendar = await this.calendarRepository.findById(id);
    if (!calendar) {
      throw new NotFoundException('Calendar not found.');
    }
    const domain = MinAdventEntityMapper.toDomain(calendar);
    if (domain.ownerId !== user.id) {
      throw new ForbiddenException('You do not own this calendar.');
    }
    return domain;
  }

  private getCurrentBerlinYear(): number {
    return Number(new Intl.DateTimeFormat('en', { timeZone: 'Europe/Berlin', year: 'numeric' }).format(new Date()));
  }
}
