import { MinAdventSharedCalendarDto } from '../models/dtos/minadvent-shared-calendar.dto';
import { MinAdventSharedDoorContentDto } from '../models/dtos/minadvent-shared-door-content.dto';
import { MinAdventSharedDoorOpenResponseDto } from '../models/dtos/minadvent-shared-door-open-response.dto';
import { MinAdventSharedDoorOpenDto } from '../models/dtos/minadvent-shared-door-open.dto';

export class MinAdventSharedCalendarServiceMock {
  public getSharedCalendar = jest.fn<Promise<MinAdventSharedCalendarDto | null>, [string]>().mockResolvedValue(null);
  public getSharedDoor = jest
    .fn<Promise<MinAdventSharedDoorContentDto | null>, [string, number]>()
    .mockResolvedValue(null);
  public openSharedDoor = jest
    .fn<Promise<MinAdventSharedDoorOpenResponseDto | null>, [string, number, MinAdventSharedDoorOpenDto]>()
    .mockResolvedValue(null);
}
