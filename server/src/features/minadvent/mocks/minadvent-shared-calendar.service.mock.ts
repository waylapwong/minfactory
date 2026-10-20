import { MinAdventSharedCalendarDto } from '../models/dtos/minadvent-shared-calendar.dto';

export class MinAdventSharedCalendarServiceMock {
  public getSharedCalendar = jest.fn<Promise<MinAdventSharedCalendarDto | null>, [string]>().mockResolvedValue(null);
}
