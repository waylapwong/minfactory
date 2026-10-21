import { MinAdventCalendarEntity } from '../models/entities/minadvent-calendar.entity';
import { MinAdventBlock } from '../models/domains/minadvent-block';

export class MinAdventCalendarRepositoryMock {
  public create = jest
    .fn<Promise<MinAdventCalendarEntity>, [Partial<MinAdventCalendarEntity>]>()
    .mockResolvedValue(new MinAdventCalendarEntity());
  public findById = jest.fn<Promise<MinAdventCalendarEntity | null>, [string]>().mockResolvedValue(null);
  public findByActiveToken = jest.fn<Promise<MinAdventCalendarEntity | null>, [string]>().mockResolvedValue(null);
  public getSharedDoor = jest.fn<Promise<MinAdventCalendarEntity | null>, [string, number]>().mockResolvedValue(null);
  public openSharedDoor = jest
    .fn<
      Promise<{ calendar: MinAdventCalendarEntity; firstOpened: boolean }>,
      [string, number, number, { year: number; month: number; day: number }]
    >()
    .mockResolvedValue({ calendar: new MinAdventCalendarEntity(), firstOpened: true });
  public findByOwner = jest.fn<Promise<MinAdventCalendarEntity[]>, [string]>().mockResolvedValue([]);
  public update = jest
    .fn<Promise<MinAdventCalendarEntity>, [MinAdventCalendarEntity, number]>()
    .mockResolvedValue(new MinAdventCalendarEntity());
  public closeDoor = jest
    .fn<Promise<MinAdventCalendarEntity>, [string, string, number, number]>()
    .mockResolvedValue(new MinAdventCalendarEntity());
  public replaceDoorBlocks = jest
    .fn<Promise<MinAdventCalendarEntity>, [string, string, number, number, () => MinAdventBlock[]]>()
    .mockResolvedValue(new MinAdventCalendarEntity());
  public updateSharing = jest
    .fn<Promise<MinAdventCalendarEntity>, [string, string, number, boolean, string | null]>()
    .mockResolvedValue(new MinAdventCalendarEntity());
}
