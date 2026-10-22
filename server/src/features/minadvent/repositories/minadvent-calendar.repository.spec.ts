import { ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { MinAdventCalendarTransactionMock } from '../mocks/minadvent-calendar-transaction.mock';
import { MinAdventCalendar } from '../models/domains/minadvent-calendar';
import { MinAdventDoorContent } from '../models/domains/minadvent-block';
import { MinAdventDoorEntity } from '../models/entities/minadvent-door.entity';
import { MinAdventBlockEntity } from '../models/entities/minadvent-block.entity';
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

  describe('delete()', () => {
    it('deletes published calendars with the expected version so foreign-key cascades remove all content', async () => {
      transaction.calendar.isPublished = true;
      transaction.calendar.activeToken = 'a'.repeat(64);

      await repository.delete('owner-1', 'calendar-1', 1);

      expect(transaction.dataSource.transaction).toHaveBeenCalledTimes(1);
      expect(transaction.calendarQueryBuilder.setLock).toHaveBeenCalledWith('pessimistic_write');
      expect(transaction.calendarQueryBuilder.where).toHaveBeenCalledWith('calendar.id = :calendarId', {
        calendarId: 'calendar-1',
      });
      expect(transaction.calendarRepository.delete).toHaveBeenCalledWith({
        id: 'calendar-1',
        ownerId: 'owner-1',
        version: 1,
      });
    });

    it('rejects calendars owned by another user without deleting them', async () => {
      await expect(repository.delete('someone-else', 'calendar-1', 1)).rejects.toBeInstanceOf(ForbiddenException);

      expect(transaction.calendarRepository.delete).not.toHaveBeenCalled();
    });

    it('returns not found for an unknown calendar', async () => {
      transaction.calendarQueryBuilder.getOne.mockResolvedValue(null);

      await expect(repository.delete('owner-1', 'calendar-1', 1)).rejects.toBeInstanceOf(NotFoundException);

      expect(transaction.calendarRepository.delete).not.toHaveBeenCalled();
    });

    it('rejects stale versions without deleting the calendar or its shared token', async () => {
      transaction.calendar.version = 2;
      transaction.calendar.isPublished = true;
      transaction.calendar.activeToken = 'a'.repeat(64);

      await expect(repository.delete('owner-1', 'calendar-1', 1)).rejects.toMatchObject({
        response: expect.objectContaining({ code: 'VERSION_CONFLICT' }),
      });

      expect(transaction.calendarRepository.delete).not.toHaveBeenCalled();
    });
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
      { title: calendar.title, recipientName: calendar.recipient, version: 5 },
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

  describe('replaceDoorBlocks()', () => {
    it('checks the expected global version before applying any block changes', async () => {
      transaction.calendar.version = 2;
      transaction.doors.push(
        Object.assign(new MinAdventDoorEntity(), {
          id: 'door-3',
          calendarId: 'calendar-1',
          day: 3,
          status: MinAdventDoorStatus.Empty,
        }),
      );

      await expect(repository.replaceDoorBlocks('owner-1', 'calendar-1', 3, 1, () => [])).rejects.toBeInstanceOf(
        ConflictException,
      );

      expect(transaction.blockRepository.find).not.toHaveBeenCalled();
      expect(transaction.blockRepository.delete).not.toHaveBeenCalled();
      expect(transaction.calendarRepository.update).not.toHaveBeenCalled();
    });

    it('rejects edits to opened doors and completed calendars without writing', async () => {
      transaction.doors.push(
        Object.assign(new MinAdventDoorEntity(), {
          id: 'door-3',
          calendarId: 'calendar-1',
          day: 3,
          status: MinAdventDoorStatus.Opened,
        }),
      );

      await expect(repository.replaceDoorBlocks('owner-1', 'calendar-1', 3, 1, () => [])).rejects.toMatchObject({
        response: expect.objectContaining({ code: 'DOOR_OPENED' }),
      });
      expect(transaction.blockRepository.delete).not.toHaveBeenCalled();

      jest.useFakeTimers();
      jest.setSystemTime(new Date('2026-12-24T23:00:00.000Z'));
      await expect(repository.replaceDoorBlocks('owner-1', 'calendar-1', 3, 1, () => [])).rejects.toMatchObject({
        response: expect.objectContaining({ code: 'CALENDAR_COMPLETED' }),
      });
      expect(transaction.blockRepository.delete).not.toHaveBeenCalled();
    });

    it('replaces all blocks and increments the calendar version once', async () => {
      const door = Object.assign(new MinAdventDoorEntity(), {
        id: 'door-3',
        calendarId: 'calendar-1',
        day: 3,
        status: MinAdventDoorStatus.Empty,
      });
      transaction.doors.push(door);
      const block = Object.assign(new MinAdventBlockEntity(), {
        position: 1,
        type: 'TEXT',
        text: '<p>Surprise</p>',
        title: null,
        url: null,
        description: null,
      });
      transaction.blockRepository.find.mockResolvedValue([]);
      transaction.calendarRepository.findOne.mockResolvedValue({
        ...transaction.calendar,
        version: 2,
        doors: [{ ...door, status: MinAdventDoorStatus.Filled, blocks: [block] }],
      });

      const result = await repository.replaceDoorBlocks('owner-1', 'calendar-1', 3, 1, () => [
        Object.assign(new MinAdventDoorContent(), block),
      ]);

      expect(transaction.calendarQueryBuilder.setLock).toHaveBeenCalledWith('pessimistic_write');
      expect(transaction.doorQueryBuilder.setLock).toHaveBeenCalledWith('pessimistic_write');
      expect(transaction.blockRepository.delete).toHaveBeenCalledWith({ doorId: 'door-3' });
      expect(transaction.blockRepository.save).toHaveBeenCalledTimes(1);
      expect(transaction.doorRepository.update).toHaveBeenCalledWith(
        { id: 'door-3' },
        { status: MinAdventDoorStatus.Filled },
      );
      expect(transaction.calendarRepository.update).toHaveBeenCalledWith(
        { id: 'calendar-1', ownerId: 'owner-1', version: 1 },
        { version: 2 },
      );
      expect(result.version).toBe(2);
    });

    it('does not increment the version when blocks are unchanged', async () => {
      const existing = Object.assign(new MinAdventBlockEntity(), {
        position: 1,
        type: 'TEXT',
        text: '<p>Same</p>',
        title: null,
        url: null,
        description: null,
      });
      const door = Object.assign(new MinAdventDoorEntity(), {
        id: 'door-3',
        calendarId: 'calendar-1',
        day: 3,
        status: MinAdventDoorStatus.Filled,
      });
      transaction.doors.push(door);
      transaction.blockRepository.find.mockResolvedValue([existing]);

      await repository.replaceDoorBlocks('owner-1', 'calendar-1', 3, 1, () => [
        Object.assign(new MinAdventDoorContent(), existing),
      ]);

      expect(transaction.blockRepository.delete).not.toHaveBeenCalled();
      expect(transaction.calendarRepository.update).not.toHaveBeenCalled();
    });
  });

  describe('openSharedDoor()', () => {
    it('checks the global version before reading the selected door', async () => {
      transaction.calendar.version = 3;

      await expect(
        repository.openSharedDoor('a'.repeat(64), 1, 2, { year: 2026, month: 12, day: 1 }),
      ).rejects.toMatchObject({
        response: expect.objectContaining({ code: 'VERSION_CONFLICT' }),
      });

      expect(transaction.doorRepository.find).not.toHaveBeenCalled();
      expect(transaction.doorRepository.update).not.toHaveBeenCalled();
    });

    it('opens FILLED atomically and increments the version once', async () => {
      const door = Object.assign(new MinAdventDoorEntity(), {
        id: 'door-1',
        calendarId: 'calendar-1',
        day: 1,
        status: MinAdventDoorStatus.Filled,
      });
      transaction.calendar.activeToken = 'a'.repeat(64);
      transaction.doors.push(door);
      const block = Object.assign(new MinAdventBlockEntity(), {
        id: 'block-1',
        doorId: door.id,
        position: 1,
        type: 'TEXT',
        text: '<p>Surprise</p>',
      });
      transaction.blockRepository.find.mockResolvedValue([block]);
      transaction.calendarRepository.findOne.mockResolvedValue({
        ...transaction.calendar,
        version: 2,
        doors: [{ ...door, status: MinAdventDoorStatus.Opened, blocks: [block] }],
      });

      const result = await repository.openSharedDoor('a'.repeat(64), 1, 1, { year: 2026, month: 12, day: 1 });

      expect(transaction.calendarQueryBuilder.setLock).toHaveBeenCalledWith('pessimistic_write');
      expect(transaction.calendarQueryBuilder.where).toHaveBeenCalledWith(
        'calendar.activeToken = :token AND calendar.isPublished = :published',
        { token: 'a'.repeat(64), published: true },
      );
      expect(transaction.doorRepository.update).toHaveBeenCalledWith(
        { id: door.id },
        { status: MinAdventDoorStatus.Opened },
      );
      expect(transaction.calendarRepository.update).toHaveBeenCalledWith(
        { id: 'calendar-1', version: 1 },
        { version: 2 },
      );
      expect(result.firstOpened).toBe(true);
      expect(result.calendar.version).toBe(2);
    });

    it('rejects empty doors and doors before their December day', async () => {
      transaction.doors.push(
        Object.assign(new MinAdventDoorEntity(), { id: 'door-1', day: 1, status: MinAdventDoorStatus.Empty }),
        Object.assign(new MinAdventDoorEntity(), { id: 'door-2', day: 2, status: MinAdventDoorStatus.Filled }),
      );

      await expect(
        repository.openSharedDoor('a'.repeat(64), 1, 1, { year: 2026, month: 12, day: 1 }),
      ).rejects.toMatchObject({
        response: expect.objectContaining({ code: 'DOOR_EMPTY' }),
      });
      await expect(
        repository.openSharedDoor('a'.repeat(64), 2, 1, { year: 2026, month: 12, day: 1 }),
      ).rejects.toMatchObject({
        response: expect.objectContaining({ code: 'DOOR_NOT_YET_UNLOCKED' }),
      });

      expect(transaction.doorRepository.update).not.toHaveBeenCalled();
      expect(transaction.calendarRepository.update).not.toHaveBeenCalled();
    });

    it('returns already opened content without a mutation when the expected version is current', async () => {
      const door = Object.assign(new MinAdventDoorEntity(), {
        id: 'door-1',
        calendarId: 'calendar-1',
        day: 1,
        status: MinAdventDoorStatus.Opened,
      });
      const filledDoor = Object.assign(new MinAdventDoorEntity(), {
        id: 'door-2',
        calendarId: 'calendar-1',
        day: 2,
        status: MinAdventDoorStatus.Filled,
      });
      transaction.doors.push(door, filledDoor);

      const result = await repository.openSharedDoor('a'.repeat(64), 1, 1, { year: 2026, month: 12, day: 1 });

      expect(result.firstOpened).toBe(false);
      expect(result.calendar.doors).toHaveLength(2);
      expect(result.calendar.doors[1].status).toBe(MinAdventDoorStatus.Filled);
      expect(transaction.doorRepository.update).not.toHaveBeenCalled();
      expect(transaction.calendarRepository.update).not.toHaveBeenCalled();
    });
  });

  describe('closeDoor()', () => {
    function addOpenedDoor(): MinAdventDoorEntity {
      const door = Object.assign(new MinAdventDoorEntity(), {
        id: 'door-1',
        calendarId: 'calendar-1',
        day: 1,
        status: MinAdventDoorStatus.Opened,
      });
      transaction.doors.push(door);
      transaction.calendarRepository.findOne.mockResolvedValue({
        ...transaction.calendar,
        version: 2,
        doors: [{ ...door, status: MinAdventDoorStatus.Filled, blocks: [] }],
      });
      return door;
    }

    it('checks the expected version before reading the door status', async () => {
      transaction.calendar.version = 2;

      await expect(repository.closeDoor('owner-1', 'calendar-1', 1, 1)).rejects.toMatchObject({
        response: expect.objectContaining({ code: 'VERSION_CONFLICT' }),
      });

      expect(transaction.doorQueryBuilder.getMany).not.toHaveBeenCalled();
      expect(transaction.doorRepository.update).not.toHaveBeenCalled();
    });

    it('returns a version conflict before checking an already completed calendar', async () => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2026-12-24T23:00:00.000Z'));
      transaction.calendar.version = 2;
      transaction.doors.push(Object.assign(new MinAdventDoorEntity(), { day: 1, status: MinAdventDoorStatus.Opened }));

      await expect(repository.closeDoor('owner-1', 'calendar-1', 1, 1)).rejects.toMatchObject({
        response: expect.objectContaining({ code: 'VERSION_CONFLICT' }),
      });

      expect(transaction.doorQueryBuilder.getMany).not.toHaveBeenCalled();
      expect(transaction.doorRepository.update).not.toHaveBeenCalled();
    });

    it('rejects status changes after completion without writing', async () => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2026-12-24T23:00:00.000Z'));
      transaction.doors.push(
        Object.assign(new MinAdventDoorEntity(), { id: 'door-1', day: 1, status: MinAdventDoorStatus.Opened }),
        ...Array.from({ length: 23 }, (_, index) =>
          Object.assign(new MinAdventDoorEntity(), { day: index + 2, status: MinAdventDoorStatus.Empty }),
        ),
      );

      await expect(repository.closeDoor('owner-1', 'calendar-1', 1, 1)).rejects.toMatchObject({
        response: expect.objectContaining({ code: 'CALENDAR_COMPLETED' }),
      });

      expect(transaction.doorQueryBuilder.setLock).toHaveBeenCalledWith('pessimistic_write');
      expect(transaction.doorRepository.update).not.toHaveBeenCalled();
      expect(transaction.calendarRepository.update).not.toHaveBeenCalled();
    });

    it('closes an opened door after the Advent period and increments the global version once', async () => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2028-01-01T00:00:00.000Z'));
      const door = addOpenedDoor();
      transaction.doors.push(Object.assign(new MinAdventDoorEntity(), { day: 2, status: MinAdventDoorStatus.Filled }));

      const updated = await repository.closeDoor('owner-1', 'calendar-1', 1, 1);

      expect(transaction.calendarQueryBuilder.setLock).toHaveBeenCalledWith('pessimistic_write');
      expect(transaction.doorQueryBuilder.setLock).toHaveBeenCalledWith('pessimistic_write');
      expect(transaction.doorRepository.update).toHaveBeenCalledWith(
        { id: door.id },
        { status: MinAdventDoorStatus.Filled },
      );
      expect(transaction.calendarRepository.update).toHaveBeenCalledWith(
        { id: 'calendar-1', ownerId: 'owner-1', version: 1 },
        { version: 2 },
      );
      expect(updated.version).toBe(2);
    });

    it('rejects a door that is not OPENED without writing', async () => {
      transaction.doors.push(
        Object.assign(new MinAdventDoorEntity(), {
          id: 'door-1',
          calendarId: 'calendar-1',
          day: 1,
          status: MinAdventDoorStatus.Filled,
        }),
      );

      await expect(repository.closeDoor('owner-1', 'calendar-1', 1, 1)).rejects.toMatchObject({
        response: expect.objectContaining({ code: 'DOOR_NOT_OPENED' }),
      });

      expect(transaction.doorRepository.update).not.toHaveBeenCalled();
      expect(transaction.calendarRepository.update).not.toHaveBeenCalled();
    });
  });
});
