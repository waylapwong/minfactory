import { ConflictException } from '@nestjs/common';
import { MinAdventCalendarTransactionMock } from '../mocks/minadvent-calendar-transaction.mock';
import { MinAdventCalendar } from '../models/domains/minadvent-calendar';
import { MinAdventDoorStatus } from '../models/entities/minadvent-door.entity';
import { MinAdventCalendarRepository } from './minadvent-calendar.repository';

describe('MinAdventCalendarRepository', () => {
  let transaction: MinAdventCalendarTransactionMock;
  let repository: MinAdventCalendarRepository;

  beforeEach(() => {
    transaction = new MinAdventCalendarTransactionMock();
    repository = new MinAdventCalendarRepository(transaction.calendarTypeOrmRepository, transaction.dataSource);
  });

  it('persists the calendar and exactly 24 empty doors in one transaction', async () => {
    const calendar = new MinAdventCalendar();
    calendar.title = 'December';
    calendar.ownerId = 'owner-1';
    calendar.year = 2026;
    calendar.doors = Array.from({ length: 24 }, (_, index) => ({ day: index + 1, status: MinAdventDoorStatus.Empty }));
    await repository.create(calendar);

    expect(transaction.dataSource.transaction).toHaveBeenCalledTimes(1);
    expect(transaction.calendarRepository.save).toHaveBeenCalledTimes(1);
    expect(transaction.doorRepository.create).toHaveBeenCalledTimes(24);
    expect(transaction.doorRepository.create.mock.calls.map(([door]) => door.day)).toEqual(
      Array.from({ length: 24 }, (_, index) => index + 1),
    );
    expect(
      transaction.doorRepository.create.mock.calls.every(([door]) => door.status === MinAdventDoorStatus.Empty),
    ).toBe(true);
    expect(transaction.doorRepository.save).toHaveBeenCalledTimes(1);
    expect(transaction.doorRepository.save.mock.calls[0][0]).toHaveLength(24);
  });

  it('updates metadata only when owner and expected global version still match', async () => {
    const calendar = Object.assign(new MinAdventCalendar(), {
      id: 'calendar-1',
      ownerId: 'owner-1',
      title: 'Updated title',
      recipientName: 'Alex',
    });

    await repository.update(calendar, 4);

    expect(transaction.calendarRepository.update).toHaveBeenCalledWith(
      { id: calendar.id, ownerId: calendar.ownerId, version: 4 },
      { title: calendar.title, recipientName: calendar.recipientName, version: 5 },
    );
  });

  it('rejects a concurrent update when the expected version no longer matches', async () => {
    transaction.calendarRepository.update.mockResolvedValue({ affected: 0 });
    const calendar = Object.assign(new MinAdventCalendar(), { id: 'calendar-1', ownerId: 'owner-1' });

    await expect(repository.update(calendar, 4)).rejects.toBeInstanceOf(ConflictException);
  });
});
