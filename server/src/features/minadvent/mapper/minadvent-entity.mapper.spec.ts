import { MinAdventCalendarEntity } from '../models/entities/minadvent-calendar.entity';
import { MinAdventDoorEntity } from '../models/entities/minadvent-door.entity';
import { MinAdventDoorStatus } from '../models/enums/minadvent-door-status.enum';
import { MinAdventEntityMapper } from './minadvent-entity.mapper';

describe('MinAdventEntityMapper', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  describe('toDomain()', () => {
    it('calculates completion at midnight on December 25 in Europe/Berlin', () => {
      const calendar = Object.assign(new MinAdventCalendarEntity(), {
        year: 2026,
        doors: [Object.assign(new MinAdventDoorEntity(), { day: 1, status: MinAdventDoorStatus.Opened, blocks: [] })],
      });
      jest.setSystemTime(new Date('2026-12-24T22:59:59.999Z'));

      expect(MinAdventEntityMapper.toDomain(calendar).completed).toBe(false);

      jest.setSystemTime(new Date('2026-12-24T23:00:00.000Z'));

      expect(MinAdventEntityMapper.toDomain(calendar).completed).toBe(true);
    });
  });
});
