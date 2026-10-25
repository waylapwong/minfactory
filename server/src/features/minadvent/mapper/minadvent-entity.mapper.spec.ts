import { MinAdventCalendarEntity } from '../models/entities/minadvent-calendar.entity';
import { MinAdventDoorEntity } from '../models/entities/minadvent-door.entity';
import { MinAdventDoorStatus } from '../models/enums/minadvent-door-status.enum';
import { MinAdventEntityMapper } from './minadvent-entity.mapper';

describe('MinAdventEntityMapper', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  describe('toDomain()', () => {
    it('calculates completion at midnight on December 25 in Europe/Berlin', () => {
      const calendar: MinAdventCalendarEntity & {
        year: number;
        doors: (MinAdventDoorEntity & { day: number; status: MinAdventDoorStatus; blocks: never[] })[];
      } = Object.assign(new MinAdventCalendarEntity(), {
        year: 2026,
        doors: [Object.assign(new MinAdventDoorEntity(), { day: 1, status: MinAdventDoorStatus.Opened, blocks: [] })],
      });
      jest.setSystemTime(new Date('2026-12-24T22:59:59.999Z'));

      expect(MinAdventEntityMapper.toDomain(calendar).completed).toBe(false);

      jest.setSystemTime(new Date('2026-12-24T23:00:00.000Z'));

      expect(MinAdventEntityMapper.toDomain(calendar).completed).toBe(true);
    });

    it('keeps a calendar with 24 empty doors editable after the deadline', () => {
      jest.setSystemTime(new Date('2026-12-24T23:00:00.000Z'));
      const calendar: MinAdventCalendarEntity & {
        year: number;
        doors: (MinAdventDoorEntity & { day: number; status: MinAdventDoorStatus; blocks: never[] })[];
      } = Object.assign(new MinAdventCalendarEntity(), {
        year: 2026,
        doors: Array.from({ length: 24 }, (_, index) =>
          Object.assign(new MinAdventDoorEntity(), { day: index + 1, status: MinAdventDoorStatus.Empty, blocks: [] }),
        ),
      });

      expect(MinAdventEntityMapper.toDomain(calendar).completed).toBe(false);
    });

    it('completes with one opened door and 23 empty doors after the deadline', () => {
      jest.setSystemTime(new Date('2026-12-24T23:00:00.000Z'));
      const calendar: MinAdventCalendarEntity & {
        year: number;
        doors: (MinAdventDoorEntity & { day: number; status: MinAdventDoorStatus; blocks: never[] })[];
      } = Object.assign(new MinAdventCalendarEntity(), {
        year: 2026,
        doors: Array.from({ length: 24 }, (_, index) =>
          Object.assign(new MinAdventDoorEntity(), {
            day: index + 1,
            status: index === 0 ? MinAdventDoorStatus.Opened : MinAdventDoorStatus.Empty,
            blocks: [],
          }),
        ),
      });

      expect(MinAdventEntityMapper.toDomain(calendar).completed).toBe(true);
    });
  });
});
