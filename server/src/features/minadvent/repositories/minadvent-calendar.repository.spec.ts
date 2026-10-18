import { ConflictException } from '@nestjs/common';
import { MinAdventCalendarTransactionMock } from '../mocks/minadvent-calendar-transaction.mock';
import { MinAdventCalendar } from '../models/domains/minadvent-calendar';
import { MinAdventDoorEntity } from '../models/entities/minadvent-door.entity';
import { MinAdventDoorStatus } from '../models/enums/minadvent-door-status.enum';
import { MinAdventCalendarRepository } from './minadvent-calendar.repository';

describe('MinAdventCalendarRepository', () => {
  let transaction: MinAdventCalendarTransactionMock;
  let repository: MinAdventCalendarRepository;

  beforeEach(() => {
    transaction = new MinAdventCalendarTransactionMock();
    repository = new MinAdventCalendarRepository(transaction.calendarTypeOrmRepository, transaction.dataSource);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('persists the calendar and exactly 24 empty doors in one transaction', async () => {
    const calendar = new MinAdventCalendar();
    calendar.title = 'December';
    calendar.ownerId = 'owner-1';
    calendar.year = 2026;
    calendar.doors = Array.from({ length: 24 }, (_, index) => ({ day: index + 1, status: MinAdventDoorStatus.Empty }));
    const created = await repository.create(calendar);

    expect(transaction.calendarRepository.create.mock.calls[0][0].id).toBeUndefined();
    expect(created.id).toBe('calendar-1');
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
    transaction.calendar.version = 4;
    const calendar = Object.assign(new MinAdventCalendar(), {
      id: 'calendar-1',
      ownerId: 'owner-1',
      title: 'Updated title',
      recipientName: 'Alex',
    });

    await repository.update(calendar, 4);

    expect(transaction.dataSource.transaction).toHaveBeenCalledTimes(1);
    expect(transaction.calendarQueryBuilder.setLock).toHaveBeenCalledWith('pessimistic_write');
    expect(transaction.doorQueryBuilder.setLock).toHaveBeenCalledWith('pessimistic_write');
    expect(transaction.calendarRepository.update).toHaveBeenCalledWith(
      { id: calendar.id, ownerId: calendar.ownerId, version: 4 },
      { title: calendar.title, recipientName: calendar.recipientName, version: 5 },
    );
  });

  it('rejects a concurrent update when the expected version no longer matches', async () => {
    transaction.calendar.version = 5;
    const calendar = Object.assign(new MinAdventCalendar(), { id: 'calendar-1', ownerId: 'owner-1' });

    const error = await repository.update(calendar, 4).catch((reason: unknown) => reason);

    expect(error).toBeInstanceOf(ConflictException);
    expect((error as ConflictException).getResponse()).toEqual(expect.objectContaining({ code: 'VERSION_CONFLICT' }));
    expect(transaction.calendarRepository.update).not.toHaveBeenCalled();
  });

  it('rejects completed calendars inside the locked update transaction', async () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-12-24T23:00:00.000Z'));
    transaction.doors.push(Object.assign(new MinAdventDoorEntity(), { day: 1, status: MinAdventDoorStatus.Opened }));
    const calendar = Object.assign(new MinAdventCalendar(), {
      id: 'calendar-1',
      ownerId: 'owner-1',
      title: 'Updated title',
      recipientName: 'Alex',
    });
    const error = await repository.update(calendar, 1).catch((reason: unknown) => reason);

    expect(error).toBeInstanceOf(ConflictException);
    expect((error as ConflictException).getResponse()).toEqual(expect.objectContaining({ code: 'CALENDAR_COMPLETED' }));
    expect(transaction.dataSource.transaction).toHaveBeenCalledTimes(1);
    expect(transaction.calendarRepository.update).not.toHaveBeenCalled();
  });
});
