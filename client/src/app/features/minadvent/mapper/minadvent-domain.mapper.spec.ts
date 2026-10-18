import { createMinAdventCalendarDto } from '../mocks/minadvent-calendar.mock';
import { MinAdventDomainMapper } from './minadvent-domain.mapper';

describe('MinAdventDomainMapper', () => {
  describe('toCalendar()', () => {
    it('should map all calendar fields and doors from the DTO', () => {
      const dto = createMinAdventCalendarDto();

      const calendar = MinAdventDomainMapper.toCalendar(dto);

      expect(calendar).toEqual(dto);
      expect(calendar.doors).not.toBe(dto.doors);
      expect(calendar.doors[0]).not.toBe(dto.doors[0]);
    });
  });
});
