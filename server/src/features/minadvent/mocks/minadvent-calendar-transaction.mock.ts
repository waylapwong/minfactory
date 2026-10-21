import { DataSource, EntityManager, Repository } from 'typeorm';
import { MinAdventCalendarEntity } from '../models/entities/minadvent-calendar.entity';
import { MinAdventDoorEntity } from '../models/entities/minadvent-door.entity';
import { MinAdventBlockEntity } from '../models/entities/minadvent-block.entity';

export class MinAdventCalendarTransactionMock {
  public readonly calendar = Object.assign(new MinAdventCalendarEntity(), {
    id: 'calendar-1',
    ownerId: 'owner-1',
    year: 2026,
    title: 'December',
    recipientName: 'Alex',
    version: 1,
  });
  public readonly calendarQueryBuilder = {
    setLock: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    getOne: jest.fn().mockImplementation(() => Promise.resolve(this.calendar)),
  };
  public readonly doors: MinAdventDoorEntity[] = [];
  public readonly calendarRepository = {
    create: jest.fn((value: Partial<MinAdventCalendarEntity>) => value),
    save: jest.fn().mockResolvedValue(this.calendar),
    update: jest.fn().mockResolvedValue({ affected: 1 }),
    findOne: jest.fn().mockResolvedValue({ ...this.calendar, doors: [] }),
    createQueryBuilder: jest.fn(() => this.calendarQueryBuilder),
  };
  public readonly calendarTypeOrmRepository = this.calendarRepository as unknown as Repository<MinAdventCalendarEntity>;
  public readonly doorQueryBuilder = {
    setLock: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    getMany: jest.fn().mockImplementation(() => Promise.resolve(this.doors)),
  };
  public readonly doorRepository = {
    create: jest.fn((value: Partial<MinAdventDoorEntity>) => value),
    find: jest.fn().mockImplementation(() => Promise.resolve(this.doors)),
    findOne: jest
      .fn()
      .mockImplementation(({ where }: { where: { calendarId: string; day: number } }) =>
        Promise.resolve(
          this.doors.find((door) => door.calendarId === where.calendarId && door.day === where.day) ?? null,
        ),
      ),
    save: jest.fn().mockResolvedValue([]),
    update: jest.fn().mockResolvedValue({ affected: 1 }),
    createQueryBuilder: jest.fn(() => this.doorQueryBuilder),
  };
  public readonly blockRepository = {
    create: jest.fn((value: Partial<MinAdventBlockEntity>) => value),
    find: jest.fn().mockResolvedValue([]),
    save: jest.fn().mockResolvedValue([]),
    delete: jest.fn().mockResolvedValue({ affected: 0 }),
  };
  public readonly manager = {
    getRepository: jest.fn(
      (entity: typeof MinAdventCalendarEntity | typeof MinAdventDoorEntity | typeof MinAdventBlockEntity) => {
        if (entity === MinAdventCalendarEntity) {
          return this.calendarRepository;
        }
        if (entity === MinAdventBlockEntity) {
          return this.blockRepository;
        }
        return this.doorRepository;
      },
    ),
  };
  public readonly dataSource = {
    transaction: jest.fn((action: (manager: EntityManager) => Promise<MinAdventCalendarEntity | null>) =>
      action(this.manager as unknown as EntityManager),
    ),
  } as unknown as DataSource;
}
