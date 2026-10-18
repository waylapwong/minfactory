import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { MinAdventDomainMapper } from '../mapper/minadvent-domain.mapper';
import { MinAdventCalendar } from '../models/domains/minadvent-calendar';
import { MinAdventCalendarEntity } from '../models/entities/minadvent-calendar.entity';
import { MinAdventDoorEntity } from '../models/entities/minadvent-door.entity';

@Injectable()
export class MinAdventCalendarRepository {
  constructor(
    @InjectRepository(MinAdventCalendarEntity)
    private readonly calendars: Repository<MinAdventCalendarEntity>,
    private readonly dataSource: DataSource,
  ) {}

  public async create(calendar: MinAdventCalendar): Promise<MinAdventCalendarEntity> {
    return this.dataSource.transaction(async (manager) => {
      const calendarRepository = manager.getRepository(MinAdventCalendarEntity);
      const doorRepository = manager.getRepository(MinAdventDoorEntity);
      const savedCalendar = await calendarRepository.save(
        calendarRepository.create(MinAdventDomainMapper.toEntity(calendar)),
      );
      const doors = MinAdventDomainMapper.toDoorEntities(calendar, savedCalendar.id).map((door) =>
        doorRepository.create(door),
      );
      await doorRepository.save(doors);
      const createdCalendar = await this.findById(savedCalendar.id, calendarRepository);
      if (!createdCalendar) {
        throw new NotFoundException('Calendar not found.');
      }
      return createdCalendar;
    });
  }

  public async findByOwner(ownerId: string): Promise<MinAdventCalendarEntity[]> {
    return this.calendars.find({
      where: { ownerId },
      relations: { doors: true },
      order: { year: 'DESC', createdAt: 'DESC', doors: { day: 'ASC' } },
    });
  }

  public async findById(id: string, repository = this.calendars): Promise<MinAdventCalendarEntity | null> {
    return repository.findOne({ where: { id }, relations: { doors: true }, order: { doors: { day: 'ASC' } } });
  }

  public async update(calendar: MinAdventCalendar, expectedVersion: number): Promise<MinAdventCalendarEntity> {
    const result = await this.calendars.update(
      { id: calendar.id, ownerId: calendar.ownerId, version: expectedVersion },
      { title: calendar.title, recipientName: calendar.recipientName, version: expectedVersion + 1 },
    );
    if (!result.affected) {
      throw new ConflictException({
        code: 'VERSION_CONFLICT',
        message: 'Der Kalender wurde zwischenzeitlich geändert.',
      });
    }
    const updatedCalendar = await this.findById(calendar.id);
    if (!updatedCalendar) {
      throw new NotFoundException('Calendar not found.');
    }
    return updatedCalendar;
  }
}
