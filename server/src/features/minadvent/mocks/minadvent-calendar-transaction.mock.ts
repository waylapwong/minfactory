import { DataSource, EntityManager, Repository } from 'typeorm';
import { MinAdventCalendarEntity } from '../models/entities/minadvent-calendar.entity';
import { MinAdventDoorEntity } from '../models/entities/minadvent-door.entity';

export class MinAdventCalendarTransactionMock {
  public readonly calendar = Object.assign(new MinAdventCalendarEntity(), { id: 'calendar-1' });
  public readonly calendarRepository = {
    create: jest.fn((value: Partial<MinAdventCalendarEntity>) => value),
    save: jest.fn().mockResolvedValue(this.calendar),
    update: jest.fn().mockResolvedValue({ affected: 1 }),
    findOne: jest.fn().mockResolvedValue({ ...this.calendar, doors: [] }),
  };
  public readonly doorRepository = {
    create: jest.fn((value: Partial<MinAdventDoorEntity>) => value),
    save: jest.fn().mockResolvedValue([]),
  };
  public readonly manager = {
    getRepository: jest.fn((entity: typeof MinAdventCalendarEntity | typeof MinAdventDoorEntity) =>
      entity === MinAdventCalendarEntity ? this.calendarRepository : this.doorRepository,
    ),
  };
  public readonly dataSource = {
    transaction: jest.fn((action: (manager: EntityManager) => Promise<MinAdventCalendarEntity | null>) =>
      action(this.manager as unknown as EntityManager),
    ),
  } as unknown as DataSource;
  public readonly calendarTypeOrmRepository = this.calendarRepository as unknown as Repository<MinAdventCalendarEntity>;
}
