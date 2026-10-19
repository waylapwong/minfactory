import { MinAdventCalendarEntity } from '../models/entities/minadvent-calendar.entity';
import { MinAdventBlock } from '../models/domains/minadvent-block';

export class MinAdventCalendarRepositoryMock {
  public create = jest
    .fn<Promise<MinAdventCalendarEntity>, [Partial<MinAdventCalendarEntity>]>()
    .mockResolvedValue(new MinAdventCalendarEntity());
  public findById = jest.fn<Promise<MinAdventCalendarEntity | null>, [string]>().mockResolvedValue(null);
  public findByOwner = jest.fn<Promise<MinAdventCalendarEntity[]>, [string]>().mockResolvedValue([]);
  public update = jest
    .fn<Promise<MinAdventCalendarEntity>, [MinAdventCalendarEntity, number]>()
    .mockResolvedValue(new MinAdventCalendarEntity());
  public replaceDoorBlocks = jest
    .fn<Promise<MinAdventCalendarEntity>, [string, string, number, number, () => MinAdventBlock[]]>()
    .mockResolvedValue(new MinAdventCalendarEntity());
}
