import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { MinAdventDomainMapper } from '../mapper/minadvent-domain.mapper';
import { MinAdventEntityMapper } from '../mapper/minadvent-entity.mapper';
import { MinAdventCalendar } from '../models/domains/minadvent-calendar';
import { MinAdventCalendarEntity } from '../models/entities/minadvent-calendar.entity';
import { MinAdventDoorEntity } from '../models/entities/minadvent-door.entity';
import { MinAdventBlock } from '../models/domains/minadvent-block';
import { MinAdventBlockEntity } from '../models/entities/minadvent-block.entity';
import { MinAdventDoorStatus } from '../models/enums/minadvent-door-status.enum';

@Injectable()
export class MinAdventCalendarRepository {
  constructor(
    @InjectRepository(MinAdventCalendarEntity)
    private readonly calendars: Repository<MinAdventCalendarEntity>,
    private readonly dataSource: DataSource,
  ) {}

  public async updateSharing(
    ownerId: string,
    calendarId: string,
    expectedVersion: number,
    published: boolean,
    activeToken: string | null,
  ): Promise<MinAdventCalendarEntity> {
    return this.dataSource.transaction(async (manager) => {
      const repository = manager.getRepository(MinAdventCalendarEntity);
      const calendar = await repository
        .createQueryBuilder('calendar')
        .setLock('pessimistic_write')
        .where('calendar.id = :calendarId AND calendar.ownerId = :ownerId', { calendarId, ownerId })
        .getOne();
      if (!calendar) {
        throw new NotFoundException('Calendar not found.');
      }
      if (calendar.version !== expectedVersion) {
        throw new ConflictException({
          code: 'VERSION_CONFLICT',
          message: 'Der Kalender wurde zwischenzeitlich geÃ¤ndert.',
        });
      }
      const result = await repository.update(
        { id: calendarId, ownerId, version: expectedVersion },
        { isPublished: published, activeToken, version: expectedVersion + 1 },
      );
      if (!result.affected) {
        throw new ConflictException({
          code: 'VERSION_CONFLICT',
          message: 'Der Kalender wurde zwischenzeitlich geÃ¤ndert.',
        });
      }
      const updated = await this.findById(calendarId, repository);
      if (!updated) {
        throw new NotFoundException('Calendar not found.');
      }
      return updated;
    });
  }

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

  public async findById(id: string, repository = this.calendars): Promise<MinAdventCalendarEntity | null> {
    return repository.findOne({
      where: { id },
      relations: { doors: { blocks: true } },
      order: { doors: { day: 'ASC', blocks: { position: 'ASC' } } },
    });
  }

  public async findByActiveToken(token: string): Promise<MinAdventCalendarEntity | null> {
    return this.calendars.findOne({
      where: { activeToken: token, isPublished: true },
      relations: { doors: true },
      order: { doors: { day: 'ASC' } },
    });
  }

  public async findByOwner(ownerId: string): Promise<MinAdventCalendarEntity[]> {
    return this.calendars.find({
      where: { ownerId },
      relations: { doors: { blocks: true } },
      order: { year: 'DESC', createdAt: 'DESC', doors: { day: 'ASC', blocks: { position: 'ASC' } } },
    });
  }

  public async update(calendar: MinAdventCalendar, expectedVersion: number): Promise<MinAdventCalendarEntity> {
    return this.dataSource.transaction(async (manager) => {
      const calendarRepository = manager.getRepository(MinAdventCalendarEntity);
      const doorRepository = manager.getRepository(MinAdventDoorEntity);
      const currentCalendar = await calendarRepository
        .createQueryBuilder('calendar')
        .setLock('pessimistic_write')
        .where('calendar.id = :id AND calendar.ownerId = :ownerId', {
          id: calendar.id,
          ownerId: calendar.ownerId,
        })
        .getOne();
      if (!currentCalendar) {
        throw new NotFoundException('Calendar not found.');
      }
      if (currentCalendar.version !== expectedVersion) {
        throw new ConflictException({
          code: 'VERSION_CONFLICT',
          message: 'Der Kalender wurde zwischenzeitlich geändert.',
        });
      }
      const currentDoors = await doorRepository
        .createQueryBuilder('door')
        .setLock('pessimistic_write')
        .where('door.calendarId = :calendarId', { calendarId: currentCalendar.id })
        .getMany();
      const currentDomain = MinAdventEntityMapper.toDomain({ ...currentCalendar, doors: currentDoors });
      if (currentDomain.completed) {
        throw new ConflictException({
          code: 'CALENDAR_COMPLETED',
          message: 'Abgeschlossene Kalender können nicht mehr bearbeitet werden.',
        });
      }

      const result = await calendarRepository.update(
        { id: calendar.id, ownerId: calendar.ownerId, version: expectedVersion },
        { title: calendar.title, recipientName: calendar.recipientName, version: expectedVersion + 1 },
      );
      if (!result.affected) {
        throw new ConflictException({
          code: 'VERSION_CONFLICT',
          message: 'Der Kalender wurde zwischenzeitlich geändert.',
        });
      }
      const updatedCalendar = await this.findById(calendar.id, calendarRepository);
      if (!updatedCalendar) {
        throw new NotFoundException('Calendar not found.');
      }
      return updatedCalendar;
    });
  }

  public async replaceDoorBlocks(
    ownerId: string,
    calendarId: string,
    day: number,
    expectedVersion: number,
    createBlocks: () => MinAdventBlock[],
  ): Promise<MinAdventCalendarEntity> {
    return this.dataSource.transaction(async (manager) => {
      const calendarRepository = manager.getRepository(MinAdventCalendarEntity);
      const doorRepository = manager.getRepository(MinAdventDoorEntity);
      const blockRepository = manager.getRepository(MinAdventBlockEntity);
      const currentCalendar = await calendarRepository
        .createQueryBuilder('calendar')
        .setLock('pessimistic_write')
        .where('calendar.id = :id AND calendar.ownerId = :ownerId', { id: calendarId, ownerId })
        .getOne();
      if (!currentCalendar) {
        throw new NotFoundException('Calendar not found.');
      }
      if (currentCalendar.version !== expectedVersion) {
        throw new ConflictException({
          code: 'VERSION_CONFLICT',
          message: 'Der Kalender wurde zwischenzeitlich geändert.',
        });
      }

      const doors = await doorRepository
        .createQueryBuilder('door')
        .setLock('pessimistic_write')
        .where('door.calendarId = :calendarId', { calendarId })
        .getMany();
      const currentDomain = MinAdventEntityMapper.toDomain({ ...currentCalendar, doors });
      if (currentDomain.completed) {
        throw new ConflictException({
          code: 'CALENDAR_COMPLETED',
          message: 'Abgeschlossene Kalender können nicht mehr bearbeitet werden.',
        });
      }
      const door = doors.find((candidate) => candidate.day === day);
      if (!door) {
        throw new NotFoundException('Door not found.');
      }
      if (door.status === MinAdventDoorStatus.Opened) {
        throw new ConflictException({
          code: 'DOOR_OPENED',
          message: 'Geöffnete Türchen können nicht bearbeitet werden.',
        });
      }

      const blocks = createBlocks();
      const currentBlocks = await blockRepository.find({ where: { doorId: door.id }, order: { position: 'ASC' } });
      if (
        this.blocksEqual(currentBlocks, blocks) &&
        door.status === (blocks.length ? MinAdventDoorStatus.Filled : MinAdventDoorStatus.Empty)
      ) {
        const unchanged = await this.findById(calendarId, calendarRepository);
        if (!unchanged) {
          throw new NotFoundException('Calendar not found.');
        }
        return unchanged;
      }
      await blockRepository.delete({ doorId: door.id });
      if (blocks.length > 0) {
        await blockRepository.save(blocks.map((block) => blockRepository.create({ ...block, doorId: door.id })));
      }
      const nextStatus = blocks.length > 0 ? MinAdventDoorStatus.Filled : MinAdventDoorStatus.Empty;
      await doorRepository.update({ id: door.id }, { status: nextStatus });
      const result = await calendarRepository.update(
        { id: calendarId, ownerId, version: expectedVersion },
        { version: expectedVersion + 1 },
      );
      if (!result.affected) {
        throw new ConflictException({
          code: 'VERSION_CONFLICT',
          message: 'Der Kalender wurde zwischenzeitlich geändert.',
        });
      }

      const updated = await this.findById(calendarId, calendarRepository);
      if (!updated) {
        throw new NotFoundException('Calendar not found.');
      }
      return updated;
    });
  }

  private blocksEqual(current: MinAdventBlockEntity[], requested: MinAdventBlock[]): boolean {
    return (
      current.length === requested.length &&
      current.every((block, index) => {
        const next = requested[index];
        return (
          block.position === next.position &&
          block.type === next.type &&
          block.text === next.text &&
          block.title === next.title &&
          block.url === next.url &&
          block.description === next.description
        );
      })
    );
  }
}
