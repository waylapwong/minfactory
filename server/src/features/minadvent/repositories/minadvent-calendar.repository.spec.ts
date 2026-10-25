import { ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { MinAdventCalendarTransactionMock } from '../mocks/minadvent-calendar-transaction.mock';
import { MinAdventBlockEntity } from '../models/entities/minadvent-block.entity';
import { MinAdventCalendarEntity } from '../models/entities/minadvent-calendar.entity';
import { MinAdventDoorEntity } from '../models/entities/minadvent-door.entity';
import { MinAdventDoorStatus } from '../models/enums/minadvent-door-status.enum';
import { MinAdventCalendarRepository } from './minadvent-calendar.repository';

describe('MinAdventCalendarRepository', () => {
  let transaction: MinAdventCalendarTransactionMock;
  let repository: MinAdventCalendarRepository;

  const createCalendarEntity = (overrides: Partial<MinAdventCalendarEntity> = {}): MinAdventCalendarEntity =>
    Object.assign(
      new MinAdventCalendarEntity(),
      {
        activeToken: null,
        doors: [],
        id: 'calendar-1',
        isPublished: false,
        ownerId: 'owner-1',
        recipientName: 'Alex',
        title: 'December',
        version: 1,
        year: 2026,
      },
      overrides,
    );

  const createDoorEntity = (
    day: number,
    status: MinAdventDoorStatus = MinAdventDoorStatus.Empty,
    blocks: MinAdventBlockEntity[] = [],
  ): MinAdventDoorEntity =>
    Object.assign(new MinAdventDoorEntity(), {
      blocks,
      calendarId: 'calendar-1',
      day,
      id: `door-${day}`,
      status,
    });

  const createCalendarWithDoor = (
    day: number,
    status: MinAdventDoorStatus = MinAdventDoorStatus.Empty,
    blocks: MinAdventBlockEntity[] = [],
    overrides: Partial<MinAdventCalendarEntity> = {},
  ): MinAdventCalendarEntity => createCalendarEntity({ ...overrides, doors: [createDoorEntity(day, status, blocks)] });

  beforeEach(() => {
    transaction = new MinAdventCalendarTransactionMock();
    repository = new MinAdventCalendarRepository(transaction.calendarTypeOrmRepository, transaction.dataSource);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('persists the calendar and exactly 24 empty doors in one transaction', async () => {
    const calendar: MinAdventCalendarEntity = Object.assign(new MinAdventCalendarEntity(), {
      ownerId: 'owner-1',
      year: 2026,
      title: 'December',
      recipientName: 'Alex',
      version: 1,
      doors: Array.from({ length: 24 }, (_, index) => createDoorEntity(index + 1)),
    });
    const created: MinAdventCalendarEntity = await repository.create(calendar);

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

      await repository.delete(createCalendarEntity());

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
      await expect(repository.delete(createCalendarEntity({ ownerId: 'someone-else' }))).rejects.toBeInstanceOf(
        ForbiddenException,
      );

      expect(transaction.calendarRepository.delete).not.toHaveBeenCalled();
    });

    it('returns not found for an unknown calendar', async () => {
      transaction.calendarQueryBuilder.getOne.mockResolvedValue(null);

      await expect(repository.delete(createCalendarEntity())).rejects.toBeInstanceOf(NotFoundException);

      expect(transaction.calendarRepository.delete).not.toHaveBeenCalled();
    });

    it('rejects stale versions without deleting the calendar or its shared token', async () => {
      transaction.calendar.version = 2;
      transaction.calendar.isPublished = true;
      transaction.calendar.activeToken = 'a'.repeat(64);

      await expect(repository.delete(createCalendarEntity())).rejects.toMatchObject({
        response: expect.objectContaining({ code: 'VERSION_CONFLICT' }),
      });

      expect(transaction.calendarRepository.delete).not.toHaveBeenCalled();
    });
  });

  it('updates metadata only when owner and expected global version still match', async () => {
    transaction.calendar.version = 4;
    const calendar: MinAdventCalendarEntity = createCalendarEntity({
      title: 'Updated title',
      version: 4,
    });

    await repository.update(calendar);

    expect(transaction.dataSource.transaction).toHaveBeenCalledTimes(1);
    expect(transaction.calendarQueryBuilder.setLock).toHaveBeenCalledWith('pessimistic_write');
    expect(transaction.calendarRepository.update).toHaveBeenCalledWith(
      { id: calendar.id, ownerId: calendar.ownerId, version: 4 },
      { title: calendar.title, recipientName: calendar.recipientName, version: 5 },
    );
  });

  it('rejects a concurrent update when the expected version no longer matches', async () => {
    transaction.calendar.version = 5;
    const calendar: MinAdventCalendarEntity = createCalendarEntity({ version: 4 });

    const error: unknown = await repository.update(calendar).catch((reason: unknown) => reason);

    expect(error).toBeInstanceOf(ConflictException);
    expect((error as ConflictException).getResponse()).toEqual(expect.objectContaining({ code: 'VERSION_CONFLICT' }));
    expect(transaction.calendarRepository.update).not.toHaveBeenCalled();
  });

  it('updates using the expected version carried by the calendar entity', async () => {
    transaction.calendar.version = 4;
    const calendar: MinAdventCalendarEntity = createCalendarEntity({ version: 4 });

    await repository.update(calendar);

    expect(transaction.calendarRepository.update).toHaveBeenCalledWith(
      { id: calendar.id, ownerId: calendar.ownerId, version: 4 },
      expect.objectContaining({ version: 5 }),
    );
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

      await expect(
        repository.replaceDoorBlocks(createCalendarWithDoor(3, MinAdventDoorStatus.Empty, [], { version: 1 }), 3),
      ).rejects.toBeInstanceOf(ConflictException);

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

      await expect(repository.replaceDoorBlocks(createCalendarWithDoor(3), 3)).rejects.toMatchObject({
        response: expect.objectContaining({ code: 'DOOR_OPENED' }),
      });
      expect(transaction.blockRepository.delete).not.toHaveBeenCalled();
    });

    it('replaces all blocks and increments the calendar version once', async () => {
      const door: MinAdventDoorEntity & { id: string; calendarId: string; day: number; status: MinAdventDoorStatus } =
        Object.assign(new MinAdventDoorEntity(), {
          id: 'door-3',
          calendarId: 'calendar-1',
          day: 3,
          status: MinAdventDoorStatus.Empty,
        });
      transaction.doors.push(door);
      const block: MinAdventBlockEntity & {
        position: number;
        type: string;
        text: string;
        title: null;
        url: null;
        description: null;
      } = Object.assign(new MinAdventBlockEntity(), {
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

      const requestedBlock: MinAdventBlockEntity = Object.assign(new MinAdventBlockEntity(), block);
      const result: MinAdventCalendarEntity = await repository.replaceDoorBlocks(
        createCalendarWithDoor(3, MinAdventDoorStatus.Empty, [requestedBlock]),
        3,
      );

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
      const existing: MinAdventBlockEntity & {
        position: number;
        type: string;
        text: string;
        title: null;
        url: null;
        description: null;
      } = Object.assign(new MinAdventBlockEntity(), {
        position: 1,
        type: 'TEXT',
        text: '<p>Same</p>',
        title: null,
        url: null,
        description: null,
      });
      const door: MinAdventDoorEntity & { id: string; calendarId: string; day: number; status: MinAdventDoorStatus } =
        Object.assign(new MinAdventDoorEntity(), {
          id: 'door-3',
          calendarId: 'calendar-1',
          day: 3,
          status: MinAdventDoorStatus.Filled,
        });
      transaction.doors.push(door);
      transaction.blockRepository.find.mockResolvedValue([existing]);

      await repository.replaceDoorBlocks(createCalendarWithDoor(3, MinAdventDoorStatus.Filled, [existing]), 3);

      expect(transaction.blockRepository.delete).not.toHaveBeenCalled();
      expect(transaction.calendarRepository.update).not.toHaveBeenCalled();
    });
  });

  describe('openSharedDoor()', () => {
    it('checks the global version before reading the selected door', async () => {
      transaction.calendar.version = 3;

      await expect(
        repository.openSharedDoor(createCalendarEntity({ activeToken: 'a'.repeat(64), version: 2 }), 1, {
          year: 2026,
          month: 12,
          day: 1,
        }),
      ).rejects.toMatchObject({
        response: expect.objectContaining({ code: 'VERSION_CONFLICT' }),
      });

      expect(transaction.doorRepository.find).not.toHaveBeenCalled();
      expect(transaction.doorRepository.update).not.toHaveBeenCalled();
    });

    it('opens FILLED atomically and increments the version once', async () => {
      const door: MinAdventDoorEntity & { id: string; calendarId: string; day: number; status: MinAdventDoorStatus } =
        Object.assign(new MinAdventDoorEntity(), {
          id: 'door-1',
          calendarId: 'calendar-1',
          day: 1,
          status: MinAdventDoorStatus.Filled,
        });
      transaction.calendar.activeToken = 'a'.repeat(64);
      transaction.doors.push(door);
      const block: MinAdventBlockEntity & { id: string; doorId: string; position: number; type: string; text: string } =
        Object.assign(new MinAdventBlockEntity(), {
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

      const result: MinAdventCalendarEntity = await repository.openSharedDoor(
        createCalendarEntity({ activeToken: 'a'.repeat(64), version: 1 }),
        1,
        { year: 2026, month: 12, day: 1 },
      );

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
      expect(result.version).toBe(2);
      expect(result.doors[0].status).toBe(MinAdventDoorStatus.Opened);
    });

    it('rejects empty doors and doors before their December day', async () => {
      transaction.doors.push(
        Object.assign(new MinAdventDoorEntity(), { id: 'door-1', day: 1, status: MinAdventDoorStatus.Empty }),
        Object.assign(new MinAdventDoorEntity(), { id: 'door-2', day: 2, status: MinAdventDoorStatus.Filled }),
      );

      await expect(
        repository.openSharedDoor(createCalendarEntity({ activeToken: 'a'.repeat(64), version: 1 }), 1, {
          year: 2026,
          month: 12,
          day: 1,
        }),
      ).rejects.toMatchObject({
        response: expect.objectContaining({ code: 'DOOR_EMPTY' }),
      });
      await expect(
        repository.openSharedDoor(createCalendarEntity({ activeToken: 'a'.repeat(64), version: 1 }), 2, {
          year: 2026,
          month: 12,
          day: 1,
        }),
      ).rejects.toMatchObject({
        response: expect.objectContaining({ code: 'DOOR_NOT_YET_UNLOCKED' }),
      });

      expect(transaction.doorRepository.update).not.toHaveBeenCalled();
      expect(transaction.calendarRepository.update).not.toHaveBeenCalled();
    });

    it('returns already opened content without a mutation when the expected version is current', async () => {
      const door: MinAdventDoorEntity & { id: string; calendarId: string; day: number; status: MinAdventDoorStatus } =
        Object.assign(new MinAdventDoorEntity(), {
          id: 'door-1',
          calendarId: 'calendar-1',
          day: 1,
          status: MinAdventDoorStatus.Opened,
        });
      const filledDoor: MinAdventDoorEntity & {
        id: string;
        calendarId: string;
        day: number;
        status: MinAdventDoorStatus;
      } = Object.assign(new MinAdventDoorEntity(), {
        id: 'door-2',
        calendarId: 'calendar-1',
        day: 2,
        status: MinAdventDoorStatus.Filled,
      });
      transaction.doors.push(door, filledDoor);

      const result: MinAdventCalendarEntity = await repository.openSharedDoor(
        createCalendarEntity({ activeToken: 'a'.repeat(64), version: 1 }),
        1,
        { year: 2026, month: 12, day: 1 },
      );

      expect(result.doors).toHaveLength(2);
      expect(result.doors[1].status).toBe(MinAdventDoorStatus.Filled);
      expect(transaction.doorRepository.update).not.toHaveBeenCalled();
      expect(transaction.calendarRepository.update).not.toHaveBeenCalled();
    });
  });

  describe('closeDoor()', () => {
    function addOpenedDoor(): MinAdventDoorEntity {
      const door: MinAdventDoorEntity & { id: string; calendarId: string; day: number; status: MinAdventDoorStatus } =
        Object.assign(new MinAdventDoorEntity(), {
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

      await expect(repository.closeDoor(createCalendarEntity(), 1)).rejects.toMatchObject({
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

      await expect(repository.closeDoor(createCalendarEntity(), 1)).rejects.toMatchObject({
        response: expect.objectContaining({ code: 'VERSION_CONFLICT' }),
      });

      expect(transaction.doorQueryBuilder.getMany).not.toHaveBeenCalled();
      expect(transaction.doorRepository.update).not.toHaveBeenCalled();
    });

    it('closes an opened door after the Advent period and increments the global version once', async () => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2028-01-01T00:00:00.000Z'));
      const door: MinAdventDoorEntity = addOpenedDoor();
      transaction.doors.push(Object.assign(new MinAdventDoorEntity(), { day: 2, status: MinAdventDoorStatus.Filled }));

      const updated: import('../models/entities/minadvent-calendar.entity').MinAdventCalendarEntity =
        await repository.closeDoor(createCalendarEntity(), 1);

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

      await expect(repository.closeDoor(createCalendarEntity(), 1)).rejects.toMatchObject({
        response: expect.objectContaining({ code: 'DOOR_NOT_OPENED' }),
      });

      expect(transaction.doorRepository.update).not.toHaveBeenCalled();
      expect(transaction.calendarRepository.update).not.toHaveBeenCalled();
    });
  });
});
