import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { MinAdventDomainMapper } from '../mapper/minadvent-domain.mapper';
import { MinAdventEntityMapper } from '../mapper/minadvent-entity.mapper';
import { MinAdventBlock } from '../models/domains/minadvent-block';
import { MinAdventCalendar } from '../models/domains/minadvent-calendar';
import { MinAdventBlockEntity } from '../models/entities/minadvent-block.entity';
import { MinAdventCalendarEntity } from '../models/entities/minadvent-calendar.entity';
import { MinAdventDoorEntity } from '../models/entities/minadvent-door.entity';
import { MinAdventDoorStatus } from '../models/enums/minadvent-door-status.enum';

@Injectable()
export class MinAdventCalendarRepository {
  constructor(
    @InjectRepository(MinAdventCalendarEntity)
    private readonly calendars: Repository<MinAdventCalendarEntity>,
    private readonly dataSource: DataSource,
  ) {}

  public async closeDoor(
    ownerId: string,
    calendarId: string,
    day: number,
    expectedVersion: number,
  ): Promise<MinAdventCalendarEntity> {
    return this.dataSource.transaction(async (manager) => {
      const calendarRepository: Repository<MinAdventCalendarEntity> = manager.getRepository(MinAdventCalendarEntity);
      const doorRepository: Repository<MinAdventDoorEntity> = manager.getRepository(MinAdventDoorEntity);
      const calendar: MinAdventCalendarEntity | null = await calendarRepository
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
          message: 'Der Kalender wurde zwischenzeitlich geändert.',
        });
      }
      const doors: MinAdventDoorEntity[] = await doorRepository
        .createQueryBuilder('door')
        .setLock('pessimistic_write')
        .where('door.calendarId = :calendarId', { calendarId })
        .getMany();
      if (MinAdventEntityMapper.toDomain({ ...calendar, doors }).completed) {
        throw new ConflictException({
          code: 'CALENDAR_COMPLETED',
          message: 'Abgeschlossene Kalender können nicht mehr bearbeitet werden.',
        });
      }
      const door: MinAdventDoorEntity | undefined = doors.find((candidate) => candidate.day === day);
      if (!door) {
        throw new NotFoundException('Door not found.');
      }
      if (door.status !== MinAdventDoorStatus.Opened) {
        throw new ConflictException({
          code: 'DOOR_NOT_OPENED',
          message: 'Nur geöffnete Türchen können geschlossen werden.',
        });
      }
      await doorRepository.update({ id: door.id }, { status: MinAdventDoorStatus.Filled });
      const result: import('C:/Users/wayla/Desktop/Projekte/minfactory/server/node_modules/typeorm/index').UpdateResult =
        await calendarRepository.update(
          { id: calendarId, ownerId, version: expectedVersion },
          { version: expectedVersion + 1 },
        );
      if (!result.affected) {
        throw new ConflictException({
          code: 'VERSION_CONFLICT',
          message: 'Der Kalender wurde zwischenzeitlich geändert.',
        });
      }
      const updated: MinAdventCalendarEntity | null = await this.findById(calendarId, calendarRepository);
      if (!updated) {
        throw new NotFoundException('Calendar not found.');
      }
      return updated;
    });
  }

  public async create(calendar: MinAdventCalendar): Promise<MinAdventCalendarEntity> {
    return this.dataSource.transaction(async (manager) => {
      const calendarRepository: Repository<MinAdventCalendarEntity> = manager.getRepository(MinAdventCalendarEntity);
      const doorRepository: Repository<MinAdventDoorEntity> = manager.getRepository(MinAdventDoorEntity);
      const savedCalendar: MinAdventCalendarEntity = await calendarRepository.save(
        calendarRepository.create(MinAdventDomainMapper.toEntity(calendar)),
      );
      const doors: MinAdventDoorEntity[] = MinAdventDomainMapper.toDoorEntities(calendar, savedCalendar.id).map(
        (door) => doorRepository.create(door),
      );
      await doorRepository.save(doors);
      const createdCalendar: MinAdventCalendarEntity | null = await this.findById(savedCalendar.id, calendarRepository);
      if (!createdCalendar) {
        throw new NotFoundException('Calendar not found.');
      }
      return createdCalendar;
    });
  }

  public async delete(ownerId: string, calendarId: string, expectedVersion: number): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      const repository: Repository<MinAdventCalendarEntity> = manager.getRepository(MinAdventCalendarEntity);
      const calendar: MinAdventCalendarEntity | null = await repository
        .createQueryBuilder('calendar')
        .setLock('pessimistic_write')
        .where('calendar.id = :calendarId', { calendarId })
        .getOne();
      if (!calendar) {
        throw new NotFoundException('Calendar not found.');
      }
      if (calendar.ownerId !== ownerId) {
        throw new ForbiddenException('You do not own this calendar.');
      }
      if (calendar.version !== expectedVersion) {
        throw new ConflictException({
          code: 'VERSION_CONFLICT',
          message: 'Der Kalender wurde zwischenzeitlich geändert.',
        });
      }
      const result: import('C:/Users/wayla/Desktop/Projekte/minfactory/server/node_modules/typeorm/index').DeleteResult =
        await repository.delete({ id: calendarId, ownerId, version: expectedVersion });
      if (!result.affected) {
        throw new ConflictException({
          code: 'VERSION_CONFLICT',
          message: 'Der Kalender wurde zwischenzeitlich geändert.',
        });
      }
    });
  }

  public async findByActiveToken(token: string): Promise<MinAdventCalendarEntity | null> {
    return this.calendars.findOne({
      where: { activeToken: token, isPublished: true },
      relations: { doors: true },
      order: { doors: { day: 'ASC' } },
    });
  }

  public async findById(id: string, repository = this.calendars): Promise<MinAdventCalendarEntity | null> {
    return repository.findOne({
      where: { id },
      relations: { doors: { blocks: true } },
      order: { doors: { day: 'ASC', blocks: { position: 'ASC' } } },
    });
  }

  public async findByOwner(ownerId: string): Promise<MinAdventCalendarEntity[]> {
    return this.calendars.find({
      where: { ownerId },
      relations: { doors: { blocks: true } },
      order: { year: 'DESC', createdAt: 'DESC', doors: { day: 'ASC', blocks: { position: 'ASC' } } },
    });
  }

  public async getSharedDoor(token: string, day: number): Promise<MinAdventCalendarEntity | null> {
    const calendar: MinAdventCalendarEntity | null = await this.calendars.findOne({
      where: { activeToken: token, isPublished: true },
      relations: { doors: { blocks: true } },
      order: { doors: { day: 'ASC', blocks: { position: 'ASC' } } },
    });
    if (!calendar) {
      return null;
    }
    calendar.doors = (calendar.doors ?? []).filter((door) => door.day === day);
    return calendar;
  }

  public async openSharedDoor(
    token: string,
    day: number,
    expectedVersion: number,
    currentDate: { year: number; month: number; day: number },
  ): Promise<{ calendar: MinAdventCalendarEntity; firstOpened: boolean }> {
    return this.dataSource.transaction(async (manager) => {
      const calendarRepository: Repository<MinAdventCalendarEntity> = manager.getRepository(MinAdventCalendarEntity);
      const doorRepository: Repository<MinAdventDoorEntity> = manager.getRepository(MinAdventDoorEntity);
      const blockRepository: Repository<MinAdventBlockEntity> = manager.getRepository(MinAdventBlockEntity);
      const calendar: MinAdventCalendarEntity | null = await calendarRepository
        .createQueryBuilder('calendar')
        .setLock('pessimistic_write')
        .where('calendar.activeToken = :token AND calendar.isPublished = :published', { token, published: true })
        .getOne();
      if (!calendar) {
        throw new NotFoundException('Shared calendar is unavailable.');
      }
      if (calendar.version !== expectedVersion) {
        throw new ConflictException({
          code: 'VERSION_CONFLICT',
          message: 'Der Kalender wurde zwischenzeitlich geändert.',
        });
      }
      const doors: MinAdventDoorEntity[] = await doorRepository.find({ where: { calendarId: calendar.id } });
      const door: MinAdventDoorEntity | undefined = doors.find((candidate) => candidate.day === day);
      if (!door) {
        throw new NotFoundException('Door not found.');
      }
      if (door.status === MinAdventDoorStatus.Opened) {
        const blocks: MinAdventBlockEntity[] = await blockRepository.find({
          where: { doorId: door.id },
          order: { position: 'ASC' },
        });
        calendar.doors = doors.map((item) => Object.assign(item, { blocks: item.id === door.id ? blocks : [] }));
        return { calendar, firstOpened: false };
      }
      if (door.status !== MinAdventDoorStatus.Filled) {
        throw new ConflictException({ code: 'DOOR_EMPTY', message: 'Dieses Türchen enthält keinen Inhalt.' });
      }
      if (
        currentDate.year < calendar.year ||
        (currentDate.year === calendar.year &&
          (currentDate.month < 12 || (currentDate.month === 12 && currentDate.day < day)))
      ) {
        throw new ConflictException({
          code: 'DOOR_NOT_YET_UNLOCKED',
          message: 'Dieses Türchen ist noch nicht freigegeben.',
        });
      }
      await doorRepository.update({ id: door.id }, { status: MinAdventDoorStatus.Opened });
      const update: import('C:/Users/wayla/Desktop/Projekte/minfactory/server/node_modules/typeorm/index').UpdateResult =
        await calendarRepository.update(
          { id: calendar.id, version: expectedVersion },
          { version: expectedVersion + 1 },
        );
      if (!update.affected) {
        throw new ConflictException({
          code: 'VERSION_CONFLICT',
          message: 'Der Kalender wurde zwischenzeitlich geändert.',
        });
      }
      const blocks: MinAdventBlockEntity[] = await blockRepository.find({
        where: { doorId: door.id },
        order: { position: 'ASC' },
      });
      const refreshed: MinAdventCalendarEntity | null = await calendarRepository.findOne({
        where: { id: calendar.id },
        relations: { doors: { blocks: true } },
        order: { doors: { day: 'ASC', blocks: { position: 'ASC' } } },
      });
      if (!refreshed) {
        throw new NotFoundException('Calendar not found.');
      }
      return { calendar: refreshed, firstOpened: true };
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
      const calendarRepository: Repository<MinAdventCalendarEntity> = manager.getRepository(MinAdventCalendarEntity);
      const doorRepository: Repository<MinAdventDoorEntity> = manager.getRepository(MinAdventDoorEntity);
      const blockRepository: Repository<MinAdventBlockEntity> = manager.getRepository(MinAdventBlockEntity);
      const currentCalendar: MinAdventCalendarEntity | null = await calendarRepository
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

      const doors: MinAdventDoorEntity[] = await doorRepository
        .createQueryBuilder('door')
        .setLock('pessimistic_write')
        .where('door.calendarId = :calendarId', { calendarId })
        .getMany();
      const currentDomain: MinAdventCalendar = MinAdventEntityMapper.toDomain({ ...currentCalendar, doors });
      if (currentDomain.completed) {
        throw new ConflictException({
          code: 'CALENDAR_COMPLETED',
          message: 'Abgeschlossene Kalender können nicht mehr bearbeitet werden.',
        });
      }
      const door: MinAdventDoorEntity | undefined = doors.find((candidate) => candidate.day === day);
      if (!door) {
        throw new NotFoundException('Door not found.');
      }
      if (door.status === MinAdventDoorStatus.Opened) {
        throw new ConflictException({
          code: 'DOOR_OPENED',
          message: 'Geöffnete Türchen können nicht bearbeitet werden.',
        });
      }

      const blocks: MinAdventBlock[] = createBlocks();
      const currentBlocks: MinAdventBlockEntity[] = await blockRepository.find({
        where: { doorId: door.id },
        order: { position: 'ASC' },
      });
      if (
        this.blocksEqual(currentBlocks, blocks) &&
        door.status === (blocks.length ? MinAdventDoorStatus.Filled : MinAdventDoorStatus.Empty)
      ) {
        const unchanged: MinAdventCalendarEntity | null = await this.findById(calendarId, calendarRepository);
        if (!unchanged) {
          throw new NotFoundException('Calendar not found.');
        }
        return unchanged;
      }
      await blockRepository.delete({ doorId: door.id });
      if (blocks.length > 0) {
        await blockRepository.save(blocks.map((block) => blockRepository.create({ ...block, doorId: door.id })));
      }
      const nextStatus: MinAdventDoorStatus.Empty | MinAdventDoorStatus.Filled =
        blocks.length > 0 ? MinAdventDoorStatus.Filled : MinAdventDoorStatus.Empty;
      await doorRepository.update({ id: door.id }, { status: nextStatus });
      const result: import('C:/Users/wayla/Desktop/Projekte/minfactory/server/node_modules/typeorm/index').UpdateResult =
        await calendarRepository.update(
          { id: calendarId, ownerId, version: expectedVersion },
          { version: expectedVersion + 1 },
        );
      if (!result.affected) {
        throw new ConflictException({
          code: 'VERSION_CONFLICT',
          message: 'Der Kalender wurde zwischenzeitlich geändert.',
        });
      }

      const updated: MinAdventCalendarEntity | null = await this.findById(calendarId, calendarRepository);
      if (!updated) {
        throw new NotFoundException('Calendar not found.');
      }
      return updated;
    });
  }

  public async update(calendar: MinAdventCalendar, expectedVersion: number): Promise<MinAdventCalendarEntity> {
    return this.dataSource.transaction(async (manager) => {
      const calendarRepository: Repository<MinAdventCalendarEntity> = manager.getRepository(MinAdventCalendarEntity);
      const doorRepository: Repository<MinAdventDoorEntity> = manager.getRepository(MinAdventDoorEntity);
      const currentCalendar: MinAdventCalendarEntity | null = await calendarRepository
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
      const currentDoors: MinAdventDoorEntity[] = await doorRepository
        .createQueryBuilder('door')
        .setLock('pessimistic_write')
        .where('door.calendarId = :calendarId', { calendarId: currentCalendar.id })
        .getMany();
      const currentDomain: MinAdventCalendar = MinAdventEntityMapper.toDomain({
        ...currentCalendar,
        doors: currentDoors,
      });
      if (currentDomain.completed) {
        throw new ConflictException({
          code: 'CALENDAR_COMPLETED',
          message: 'Abgeschlossene Kalender können nicht mehr bearbeitet werden.',
        });
      }

      const result: import('C:/Users/wayla/Desktop/Projekte/minfactory/server/node_modules/typeorm/index').UpdateResult =
        await calendarRepository.update(
          { id: calendar.id, ownerId: calendar.ownerId, version: expectedVersion },
          { title: calendar.title, recipientName: calendar.recipientName, version: expectedVersion + 1 },
        );
      if (!result.affected) {
        throw new ConflictException({
          code: 'VERSION_CONFLICT',
          message: 'Der Kalender wurde zwischenzeitlich geändert.',
        });
      }
      const updatedCalendar: MinAdventCalendarEntity | null = await this.findById(calendar.id, calendarRepository);
      if (!updatedCalendar) {
        throw new NotFoundException('Calendar not found.');
      }
      return updatedCalendar;
    });
  }

  public async updateSharing(
    ownerId: string,
    calendarId: string,
    expectedVersion: number,
    published: boolean,
    activeToken: string | null,
  ): Promise<MinAdventCalendarEntity> {
    return this.dataSource.transaction(async (manager) => {
      const repository: Repository<MinAdventCalendarEntity> = manager.getRepository(MinAdventCalendarEntity);
      const calendar: MinAdventCalendarEntity | null = await repository
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
          message: 'Der Kalender wurde zwischenzeitlich geändert.',
        });
      }
      const result: import('C:/Users/wayla/Desktop/Projekte/minfactory/server/node_modules/typeorm/index').UpdateResult =
        await repository.update(
          { id: calendarId, ownerId, version: expectedVersion },
          { isPublished: published, activeToken, version: expectedVersion + 1 },
        );
      if (!result.affected) {
        throw new ConflictException({
          code: 'VERSION_CONFLICT',
          message: 'Der Kalender wurde zwischenzeitlich geändert.',
        });
      }
      const updated: MinAdventCalendarEntity | null = await this.findById(calendarId, repository);
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
        const next: MinAdventBlock = requested[index];
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
