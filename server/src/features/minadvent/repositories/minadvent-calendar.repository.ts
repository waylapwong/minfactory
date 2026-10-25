import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
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

  public async closeDoor(calendarEntity: MinAdventCalendarEntity, day: number): Promise<MinAdventCalendarEntity> {
    const ownerId: string = calendarEntity.ownerId;
    const calendarId: string = calendarEntity.id;
    const expectedVersion: number = calendarEntity.version;
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
      const result: import('typeorm').UpdateResult = await calendarRepository.update(
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

  public async create(calendarEntity: MinAdventCalendarEntity): Promise<MinAdventCalendarEntity> {
    return this.dataSource.transaction(async (manager) => {
      const calendarRepository: Repository<MinAdventCalendarEntity> = manager.getRepository(MinAdventCalendarEntity);
      const doorRepository: Repository<MinAdventDoorEntity> = manager.getRepository(MinAdventDoorEntity);
      const blockRepository: Repository<MinAdventBlockEntity> = manager.getRepository(MinAdventBlockEntity);
      const doorsToSave: MinAdventDoorEntity[] = calendarEntity.doors ?? [];
      const calendarToSave: MinAdventCalendarEntity = Object.assign(new MinAdventCalendarEntity(), calendarEntity, {
        doors: [],
      });
      const savedCalendar: MinAdventCalendarEntity = await calendarRepository.save(
        calendarRepository.create(calendarToSave),
      );
      const savedDoors: MinAdventDoorEntity[] = await doorRepository.save(
        doorsToSave.map((door: MinAdventDoorEntity) =>
          doorRepository.create(
            Object.assign(new MinAdventDoorEntity(), door, {
              blocks: [],
              calendarId: savedCalendar.id,
            }),
          ),
        ),
      );
      const blocksToSave: MinAdventBlockEntity[] = doorsToSave.flatMap((door, index) =>
        (door.blocks ?? []).map((block: MinAdventBlockEntity) =>
          blockRepository.create(Object.assign(new MinAdventBlockEntity(), block, { doorId: savedDoors[index].id })),
        ),
      );
      if (blocksToSave.length > 0) {
        await blockRepository.save(blocksToSave);
      }
      const createdCalendar: MinAdventCalendarEntity | null = await this.findById(savedCalendar.id, calendarRepository);
      if (!createdCalendar) {
        throw new NotFoundException('Calendar not found.');
      }
      return createdCalendar;
    });
  }

  public async delete(calendarEntity: MinAdventCalendarEntity): Promise<void> {
    const ownerId: string = calendarEntity.ownerId;
    const calendarId: string = calendarEntity.id;
    const expectedVersion: number = calendarEntity.version;
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
      const result: import('typeorm').DeleteResult = await repository.delete({
        id: calendarId,
        ownerId,
        version: expectedVersion,
      });
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
    calendarEntity: MinAdventCalendarEntity,
    day: number,
    currentDate: { year: number; month: number; day: number },
  ): Promise<MinAdventCalendarEntity> {
    const token: string | null = calendarEntity.activeToken;
    const expectedVersion: number = calendarEntity.version;
    if (!token) {
      throw new NotFoundException('Shared calendar is unavailable.');
    }
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
        return calendar;
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
      const update: import('typeorm').UpdateResult = await calendarRepository.update(
        { id: calendar.id, version: expectedVersion },
        { version: expectedVersion + 1 },
      );
      if (!update.affected) {
        throw new ConflictException({
          code: 'VERSION_CONFLICT',
          message: 'Der Kalender wurde zwischenzeitlich geändert.',
        });
      }
      const refreshed: MinAdventCalendarEntity | null = await calendarRepository.findOne({
        where: { id: calendar.id },
        relations: { doors: { blocks: true } },
        order: { doors: { day: 'ASC', blocks: { position: 'ASC' } } },
      });
      if (!refreshed) {
        throw new NotFoundException('Calendar not found.');
      }
      return refreshed;
    });
  }

  public async replaceDoorBlocks(
    calendarEntity: MinAdventCalendarEntity,
    day: number,
  ): Promise<MinAdventCalendarEntity> {
    const ownerId: string = calendarEntity.ownerId;
    const calendarId: string = calendarEntity.id;
    const expectedVersion: number = calendarEntity.version;
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

      const requestedDoor: MinAdventDoorEntity | undefined = calendarEntity.doors?.find(
        (item: MinAdventDoorEntity) => item.day === day,
      );
      if (!requestedDoor) {
        throw new NotFoundException('Door not found.');
      }
      const blocks: MinAdventBlockEntity[] = requestedDoor.blocks ?? [];
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
      const result: import('typeorm').UpdateResult = await calendarRepository.update(
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

  public async update(calendarEntity: MinAdventCalendarEntity): Promise<MinAdventCalendarEntity> {
    const expectedVersion: number = calendarEntity.version;
    return this.dataSource.transaction(async (manager) => {
      const calendarRepository: Repository<MinAdventCalendarEntity> = manager.getRepository(MinAdventCalendarEntity);
      const currentCalendar: MinAdventCalendarEntity | null = await calendarRepository
        .createQueryBuilder('calendar')
        .setLock('pessimistic_write')
        .where('calendar.id = :id AND calendar.ownerId = :ownerId', {
          id: calendarEntity.id,
          ownerId: calendarEntity.ownerId,
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
      const result: import('typeorm').UpdateResult = await calendarRepository.update(
        { id: calendarEntity.id, ownerId: calendarEntity.ownerId, version: expectedVersion },
        {
          title: calendarEntity.title,
          recipientName: calendarEntity.recipientName,
          version: expectedVersion + 1,
        },
      );
      if (!result.affected) {
        throw new ConflictException({
          code: 'VERSION_CONFLICT',
          message: 'Der Kalender wurde zwischenzeitlich geändert.',
        });
      }
      const updatedCalendar: MinAdventCalendarEntity | null = await this.findById(
        calendarEntity.id,
        calendarRepository,
      );
      if (!updatedCalendar) {
        throw new NotFoundException('Calendar not found.');
      }
      return updatedCalendar;
    });
  }

  public async updateSharing(calendarEntity: MinAdventCalendarEntity): Promise<MinAdventCalendarEntity> {
    const ownerId: string = calendarEntity.ownerId;
    const calendarId: string = calendarEntity.id;
    const expectedVersion: number = calendarEntity.version;
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
      const result: import('typeorm').UpdateResult = await repository.update(
        { id: calendarId, ownerId, version: expectedVersion },
        {
          isPublished: calendarEntity.isPublished,
          activeToken: calendarEntity.activeToken,
          version: expectedVersion + 1,
        },
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

  private blocksEqual(current: MinAdventBlockEntity[], requested: MinAdventBlockEntity[]): boolean {
    return (
      current.length === requested.length &&
      current.every((block, index) => {
        const next: MinAdventBlockEntity = requested[index];
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
