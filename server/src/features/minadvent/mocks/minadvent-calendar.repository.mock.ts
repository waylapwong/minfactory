import { MinAdventCalendarEntity } from '../models/entities/minadvent-calendar.entity';

export class MinAdventCalendarRepositoryMock {
  public create = jest
    .fn<Promise<MinAdventCalendarEntity>, [MinAdventCalendarEntity]>()
    .mockResolvedValue(new MinAdventCalendarEntity());
  public delete = jest.fn<Promise<void>, [MinAdventCalendarEntity]>().mockResolvedValue(undefined);
  public findById = jest.fn<Promise<MinAdventCalendarEntity | null>, [string]>().mockResolvedValue(null);
  public findByActiveToken = jest.fn<Promise<MinAdventCalendarEntity | null>, [string]>().mockResolvedValue(null);
  public getSharedDoor = jest.fn<Promise<MinAdventCalendarEntity | null>, [string, number]>().mockResolvedValue(null);
  public openSharedDoor = jest
    .fn<
      Promise<MinAdventCalendarEntity>,
      [MinAdventCalendarEntity, number, { year: number; month: number; day: number }]
    >()
    .mockResolvedValue(new MinAdventCalendarEntity());
  public findByOwner = jest.fn<Promise<MinAdventCalendarEntity[]>, [string]>().mockResolvedValue([]);
  public update = jest
    .fn<Promise<MinAdventCalendarEntity>, [MinAdventCalendarEntity]>()
    .mockResolvedValue(new MinAdventCalendarEntity());
  public closeDoor = jest
    .fn<Promise<MinAdventCalendarEntity>, [MinAdventCalendarEntity, number]>()
    .mockResolvedValue(new MinAdventCalendarEntity());
  public replaceDoorBlocks = jest
    .fn<Promise<MinAdventCalendarEntity>, [MinAdventCalendarEntity, number]>()
    .mockResolvedValue(new MinAdventCalendarEntity());
  public updateSharing = jest
    .fn<Promise<MinAdventCalendarEntity>, [MinAdventCalendarEntity]>()
    .mockResolvedValue(new MinAdventCalendarEntity());
}
