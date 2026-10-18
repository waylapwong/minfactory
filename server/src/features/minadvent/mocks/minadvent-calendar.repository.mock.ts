import { MinAdventCalendarEntity } from '../models/entities/minadvent-calendar.entity';

export class MinAdventCalendarRepositoryMock {
  public create = jest
    .fn<Promise<MinAdventCalendarEntity>, [Partial<MinAdventCalendarEntity>]>()
    .mockResolvedValue(new MinAdventCalendarEntity());
  public findById = jest.fn<Promise<MinAdventCalendarEntity | null>, [string]>().mockResolvedValue(null);
  public findByOwner = jest.fn<Promise<MinAdventCalendarEntity[]>, [string]>().mockResolvedValue([]);
  public update = jest
    .fn<Promise<MinAdventCalendarEntity>, [MinAdventCalendarEntity, number]>()
    .mockResolvedValue(new MinAdventCalendarEntity());
}
