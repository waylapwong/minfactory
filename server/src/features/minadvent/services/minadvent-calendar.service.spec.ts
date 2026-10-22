import { BadRequestException, ConflictException, ForbiddenException } from '@nestjs/common';
import { MinFactoryUser } from '../../minfactory/models/domains/minfactory-user';
import { MinAdventCalendarRepositoryMock } from '../mocks/minadvent-calendar.repository.mock';
import { MinAdventDoorContent } from '../models/domains/minadvent-block';
import { MinAdventCalendarEntity } from '../models/entities/minadvent-calendar.entity';
import { MinAdventDoorEntity } from '../models/entities/minadvent-door.entity';
import { MinAdventDoorContentType } from '../models/enums/minadvent-door-content-type.enum';
import { MinAdventDoorStatus } from '../models/enums/minadvent-door-status.enum';
import { MinAdventCalendarService } from './minadvent-calendar.service';

describe('MinAdventCalendarService', () => {
  let service: MinAdventCalendarService;
  let repository: MinAdventCalendarRepositoryMock;
  const owner = { id: 'owner-1' } as MinFactoryUser;

  beforeEach(() => {
    repository = new MinAdventCalendarRepositoryMock();
    service = new MinAdventCalendarService(repository as never);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('creates a calendar with exactly 24 empty doors', async () => {
    const calendar = new MinAdventCalendarEntity();
    calendar.id = 'calendar-1';
    calendar.title = 'December';
    calendar.recipientName = 'Alex';
    calendar.year = 1901;
    calendar.version = 1;
    calendar.isPublished = false;
    calendar.doors = Array.from({ length: 24 }, (_, index) => ({
      day: 24 - index,
      status: MinAdventDoorStatus.Empty,
    })) as MinAdventCalendarEntity['doors'];
    repository.create.mockResolvedValue(calendar);

    const result = await service.create(owner, { title: 'December', recipientName: 'Alex', year: 1901 });

    expect(repository.create).toHaveBeenCalledWith(expect.objectContaining({ ownerId: owner.id, year: 1901 }));
    expect(result.id).toBe('calendar-1');
    expect(result.doors).toHaveLength(24);
    expect(result.doors.map((door) => door.day)).toEqual(Array.from({ length: 24 }, (_, index) => index + 1));
    expect(result.doors.every((door) => door.status === MinAdventDoorStatus.Empty)).toBe(true);
  });

  it('rejects years outside the supported calendar range', async () => {
    await expect(service.create(owner, { title: 'December', recipientName: 'Alex', year: 0 })).rejects.toThrow();
    await expect(service.create(owner, { title: 'December', recipientName: 'Alex', year: 10000 })).rejects.toThrow();
    expect(repository.create).not.toHaveBeenCalled();
  });

  it('rejects calendar titles and recipient names longer than 50 characters', async () => {
    await expect(service.create(owner, { title: 'T'.repeat(51), recipientName: 'Alex', year: 2026 })).rejects.toThrow();
    await expect(
      service.create(owner, { title: 'December', recipientName: 'A'.repeat(51), year: 2026 }),
    ).rejects.toThrow();
  });

  it('accepts the first and last supported calendar years', async () => {
    await service.create(owner, { title: 'First', recipientName: 'Alex', year: 1 });
    await service.create(owner, { title: 'Last', recipientName: 'Alex', year: 9999 });

    expect(repository.create).toHaveBeenNthCalledWith(1, expect.objectContaining({ year: 1 }));
    expect(repository.create).toHaveBeenNthCalledWith(2, expect.objectContaining({ year: 9999 }));
  });

  it.each([
    { currentTime: '2026-12-24T22:59:59.000Z', year: 2026, statuses: [MinAdventDoorStatus.Opened], completed: false },
    { currentTime: '2026-12-24T23:00:00.000Z', year: 2026, statuses: [MinAdventDoorStatus.Opened], completed: true },
    { currentTime: '2026-12-24T23:00:00.000Z', year: 2026, statuses: [], completed: false },
    { currentTime: '2026-12-24T23:00:00.000Z', year: 2027, statuses: [MinAdventDoorStatus.Opened], completed: false },
    {
      currentTime: '2026-12-24T23:00:00.000Z',
      year: 2026,
      statuses: [MinAdventDoorStatus.Opened, MinAdventDoorStatus.Filled],
      completed: false,
    },
  ])(
    'derives completed from Berlin time, calendar year and door states',
    async ({ currentTime, year, statuses, completed }) => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date(currentTime));
      const calendar = Object.assign(new MinAdventCalendarEntity(), {
        id: 'calendar-1',
        ownerId: owner.id,
        year,
        doors: statuses.map((status, index) => Object.assign(new MinAdventDoorEntity(), { day: index + 1, status })),
      });
      repository.findById.mockResolvedValue(calendar);

      const result = await service.get(owner, calendar.id);

      expect(result.completed).toBe(completed);
    },
  );

  it('does not expose another owner calendar', async () => {
    const calendar = new MinAdventCalendarEntity();
    calendar.ownerId = 'someone-else';
    repository.findById.mockResolvedValue(calendar);

    await expect(service.get(owner, 'calendar-1')).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('rejects metadata changes made with an outdated global version', async () => {
    const calendar = new MinAdventCalendarEntity();
    calendar.id = 'calendar-1';
    calendar.ownerId = owner.id;
    calendar.version = 3;
    repository.findById.mockResolvedValue(calendar);

    await expect(service.update(owner, calendar.id, { title: 'New title', expectedVersion: 2 })).rejects.toBeInstanceOf(
      ConflictException,
    );
    expect(repository.update).not.toHaveBeenCalled();
  });

  it('does not increase the version when metadata is unchanged', async () => {
    const calendar = new MinAdventCalendarEntity();
    calendar.id = 'calendar-1';
    calendar.ownerId = owner.id;
    calendar.title = 'Same title';
    calendar.recipientName = 'Alex';
    calendar.version = 3;
    repository.findById.mockResolvedValue(calendar);

    const result = await service.update(owner, calendar.id, { title: 'Same title', expectedVersion: 3 });

    expect(result.version).toBe(3);
    expect(repository.update).not.toHaveBeenCalled();
  });

  describe('updateSharing()', () => {
    it('publishes with a cryptographically random token and advances the global version', async () => {
      const calendar = Object.assign(new MinAdventCalendarEntity(), {
        id: 'calendar-1',
        ownerId: owner.id,
        title: 'December',
        recipientName: 'Alex',
        year: 2026,
        version: 2,
        isPublished: true,
        activeToken: 'a'.repeat(64),
        doors: [],
      });
      repository.findById.mockResolvedValue(Object.assign({}, calendar, { isPublished: false, activeToken: null }));
      repository.updateSharing.mockResolvedValue(calendar);

      const result = await service.updateSharing(owner, calendar.id, { published: true, expectedVersion: 2 });

      expect(repository.updateSharing).toHaveBeenCalledWith(
        owner.id,
        calendar.id,
        2,
        true,
        expect.stringMatching(/^[a-f0-9]{64}$/),
      );
      expect(result).toEqual({
        published: true,
        sharedUrl: `/minadvent/shared/${calendar.activeToken}`,
        version: 2,
        completed: false,
      });
    });

    it('keeps the current version for an unchanged sharing state', async () => {
      const calendar = Object.assign(new MinAdventCalendarEntity(), {
        id: 'calendar-1',
        ownerId: owner.id,
        version: 4,
        isPublished: false,
        activeToken: null,
        doors: [],
      });
      repository.findById.mockResolvedValue(calendar);

      const result = await service.updateSharing(owner, calendar.id, { published: false, expectedVersion: 4 });

      expect(repository.updateSharing).not.toHaveBeenCalled();
      expect(result.version).toBe(4);
      expect(result.sharedUrl).toBeUndefined();
    });

    it('rejects stale global versions before applying a sharing change', async () => {
      const calendar = Object.assign(new MinAdventCalendarEntity(), {
        id: 'calendar-1',
        ownerId: owner.id,
        version: 5,
        isPublished: false,
        activeToken: null,
        doors: [],
      });
      repository.findById.mockResolvedValue(calendar);

      await expect(service.updateSharing(owner, calendar.id, { published: true, expectedVersion: 4 })).rejects.toThrow(
        ConflictException,
      );
      expect(repository.updateSharing).not.toHaveBeenCalled();
    });
  });

  describe('rotateSharingToken()', () => {
    it('replaces the active token using the current global version', async () => {
      const calendar = Object.assign(new MinAdventCalendarEntity(), {
        id: 'calendar-1',
        ownerId: owner.id,
        title: 'December',
        recipientName: 'Alex',
        year: 2026,
        version: 4,
        isPublished: true,
        activeToken: 'b'.repeat(64),
        doors: [],
      });
      repository.findById.mockResolvedValue(calendar);
      repository.updateSharing.mockResolvedValue(calendar);

      await service.rotateSharingToken(owner, calendar.id, { expectedVersion: 4 });

      expect(repository.updateSharing).toHaveBeenCalledWith(
        owner.id,
        calendar.id,
        4,
        true,
        expect.stringMatching(/^[a-f0-9]{64}$/),
      );
    });

    it('rejects rotation when the calendar is unpublished', async () => {
      const calendar = Object.assign(new MinAdventCalendarEntity(), {
        id: 'calendar-1',
        ownerId: owner.id,
        version: 4,
        isPublished: false,
        activeToken: null,
        doors: [],
      });
      repository.findById.mockResolvedValue(calendar);

      await expect(service.rotateSharingToken(owner, calendar.id, { expectedVersion: 4 })).rejects.toThrow();
      expect(repository.updateSharing).not.toHaveBeenCalled();
    });
  });

  describe('getSharedCalendar()', () => {
    it('returns calendar metadata and door statuses without private block content', async () => {
      const calendar = Object.assign(new MinAdventCalendarEntity(), {
        id: 'calendar-1',
        ownerId: owner.id,
        title: 'December',
        recipientName: 'Alex',
        year: 2026,
        version: 3,
        isPublished: true,
        activeToken: 'c'.repeat(64),
        doors: [{ day: 1, status: MinAdventDoorStatus.Filled, blocks: [{ text: 'private' }] }],
      });
      repository.findByActiveToken.mockResolvedValue(calendar);

      const result = await service.getSharedCalendar(calendar.activeToken);

      expect(repository.findByActiveToken).toHaveBeenCalledWith(calendar.activeToken);
      expect(result).toEqual({
        title: 'December',
        recipientName: 'Alex',
        year: 2026,
        version: 3,
        completed: false,
        doors: [{ day: 1, status: MinAdventDoorStatus.Filled }],
      });
      expect(result?.doors[0]).not.toHaveProperty('blocks');
    });

    it('returns unavailable for malformed or inactive tokens', async () => {
      await expect(service.getSharedCalendar('short')).resolves.toBeNull();
      repository.findByActiveToken.mockResolvedValue(null);
      await expect(service.getSharedCalendar('d'.repeat(64))).resolves.toBeNull();
      expect(repository.findByActiveToken).toHaveBeenCalledTimes(1);
    });
  });

  describe('getSharedDoor()', () => {
    it('returns blocks only for a currently opened door', async () => {
      repository.getSharedDoor.mockResolvedValue(
        Object.assign(new MinAdventCalendarEntity(), {
          id: 'calendar-1',
          ownerId: owner.id,
          year: 2026,
          version: 5,
          doors: [
            Object.assign(new MinAdventDoorEntity(), {
              day: 2,
              status: MinAdventDoorStatus.Opened,
              blocks: [{ position: 1, type: MinAdventDoorContentType.Text, text: '<p>Surprise</p>' }],
            }),
          ],
        }),
      );

      await expect(service.getSharedDoor('e'.repeat(64), 2)).resolves.toEqual({
        day: 2,
        status: MinAdventDoorStatus.Opened,
        blocks: [
          {
            position: 1,
            type: MinAdventDoorContentType.Text,
            text: '<p>Surprise</p>',
            title: undefined,
            url: undefined,
            description: undefined,
          },
        ],
      });
    });

    it('rejects access to content unless the door is currently opened', async () => {
      repository.getSharedDoor.mockResolvedValue(
        Object.assign(new MinAdventCalendarEntity(), {
          id: 'calendar-1',
          year: 2026,
          doors: [
            Object.assign(new MinAdventDoorEntity(), {
              day: 2,
              status: MinAdventDoorStatus.Filled,
              blocks: [{ text: 'private' }],
            }),
          ],
        }),
      );

      await expect(service.getSharedDoor('f'.repeat(64), 2)).rejects.toMatchObject({
        response: expect.objectContaining({ code: 'DOOR_NOT_OPENED' }),
      });
    });
  });

  describe('openSharedDoor()', () => {
    it('returns the animation flag and opened content from the atomic repository operation', async () => {
      repository.openSharedDoor.mockResolvedValue({
        calendar: Object.assign(new MinAdventCalendarEntity(), {
          id: 'calendar-1',
          year: 2026,
          version: 6,
          doors: [
            Object.assign(new MinAdventDoorEntity(), {
              day: 2,
              status: MinAdventDoorStatus.Opened,
              blocks: [{ position: 1, type: MinAdventDoorContentType.Text, text: '<p>Surprise</p>' }],
            }),
          ],
        }),
        firstOpened: true,
      });

      const result = await service.openSharedDoor('a'.repeat(64), 2, { expectedVersion: 5 });

      expect(repository.openSharedDoor).toHaveBeenCalledWith(
        'a'.repeat(64),
        2,
        5,
        expect.objectContaining({ year: expect.any(Number), month: expect.any(Number), day: expect.any(Number) }),
      );
      expect(result).toMatchObject({
        day: 2,
        status: MinAdventDoorStatus.Opened,
        version: 6,
        firstOpened: true,
        completed: false,
      });
      expect(result?.blocks[0].text).toBe('<p>Surprise</p>');
    });

    it('completes when the last filled door is opened after the deadline', async () => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2026-12-24T23:00:00.000Z'));
      repository.openSharedDoor.mockResolvedValue({
        calendar: Object.assign(new MinAdventCalendarEntity(), {
          id: 'calendar-1',
          year: 2026,
          version: 6,
          doors: Array.from({ length: 24 }, (_, index) =>
            Object.assign(new MinAdventDoorEntity(), {
              day: index + 1,
              status: index === 0 ? MinAdventDoorStatus.Opened : MinAdventDoorStatus.Empty,
              blocks: [],
            }),
          ),
        }),
        firstOpened: true,
      });

      const result = await service.openSharedDoor('a'.repeat(64), 1, { expectedVersion: 5 });

      expect(result).toMatchObject({
        day: 1,
        status: MinAdventDoorStatus.Opened,
        version: 6,
        firstOpened: true,
        completed: true,
      });
    });

    it('does not retry a stale open request', async () => {
      repository.openSharedDoor.mockRejectedValue(new ConflictException({ code: 'VERSION_CONFLICT' }));

      await expect(service.openSharedDoor('a'.repeat(64), 2, { expectedVersion: 4 })).rejects.toThrow(
        ConflictException,
      );
      expect(repository.openSharedDoor).toHaveBeenCalledTimes(1);
    });
  });

  describe('updateDoorStatus()', () => {
    const currentCalendar = (calendarOwnerId = owner.id): MinAdventCalendarEntity =>
      Object.assign(new MinAdventCalendarEntity(), {
        id: 'calendar-1',
        ownerId: calendarOwnerId,
        year: 2026,
        version: 8,
        doors: [],
      });

    it.each([1, 24])('closes boundary day %i and maps the updated response', async (day) => {
      const calendar = currentCalendar();
      const updatedCalendar = Object.assign(new MinAdventCalendarEntity(), {
        ...calendar,
        version: 9,
        doors: [Object.assign(new MinAdventDoorEntity(), { day, status: MinAdventDoorStatus.Filled })],
      });
      repository.findById.mockResolvedValue(calendar);
      repository.closeDoor.mockResolvedValue(updatedCalendar);

      const result = await service.updateDoorStatus(owner, calendar.id, day, {
        status: MinAdventDoorStatus.Filled,
        expectedVersion: 8,
      });

      expect(repository.closeDoor).toHaveBeenCalledWith(owner.id, calendar.id, day, 8);
      expect(result).toEqual({ day, status: MinAdventDoorStatus.Filled, version: 9, completed: false });
    });

    it.each([0, 25, 1.5])('rejects invalid day %s before accessing the repository', async (day) => {
      await expect(
        service.updateDoorStatus(owner, 'calendar-1', day, {
          status: MinAdventDoorStatus.Filled,
          expectedVersion: 8,
        }),
      ).rejects.toBeInstanceOf(BadRequestException);

      expect(repository.findById).not.toHaveBeenCalled();
      expect(repository.closeDoor).not.toHaveBeenCalled();
    });

    it('rejects a calendar owned by another user without closing a door', async () => {
      const calendar = currentCalendar('someone-else');
      repository.findById.mockResolvedValue(calendar);

      await expect(
        service.updateDoorStatus(owner, calendar.id, 3, {
          status: MinAdventDoorStatus.Filled,
          expectedVersion: 8,
        }),
      ).rejects.toBeInstanceOf(ForbiddenException);

      expect(repository.closeDoor).not.toHaveBeenCalled();
    });

    it('propagates repository conflicts', async () => {
      const calendar = currentCalendar();
      repository.findById.mockResolvedValue(calendar);
      repository.closeDoor.mockRejectedValue(new ConflictException({ code: 'DOOR_NOT_OPENED' }));

      await expect(
        service.updateDoorStatus(owner, calendar.id, 3, {
          status: MinAdventDoorStatus.Filled,
          expectedVersion: 8,
        }),
      ).rejects.toThrow(ConflictException);

      expect(repository.closeDoor).toHaveBeenCalledWith(owner.id, calendar.id, 3, 8);
    });
  });

  describe('updateDoor()', () => {
    const currentCalendar = (): MinAdventCalendarEntity =>
      Object.assign(new MinAdventCalendarEntity(), {
        id: 'calendar-1',
        ownerId: owner.id,
        year: 2026,
        title: 'December',
        recipientName: 'Alex',
        version: 4,
        doors: [Object.assign(new MinAdventDoorEntity(), { id: 'door-3', day: 3, status: MinAdventDoorStatus.Empty })],
      });

    const captureBlocks = (): MinAdventDoorContent[][] => {
      const saved: MinAdventDoorContent[][] = [];
      repository.replaceDoorBlocks.mockImplementation((_ownerId, _id, day, expectedVersion, createBlocks) => {
        const blocks = createBlocks();
        saved.push(blocks);
        const calendar = currentCalendar();
        calendar.version = expectedVersion + 1;
        calendar.doors[0].day = day;
        calendar.doors[0].blocks = blocks;
        calendar.doors[0].status = blocks.length ? MinAdventDoorStatus.Filled : MinAdventDoorStatus.Empty;
        return Promise.resolve(calendar);
      });
      return saved;
    };

    it('accepts an empty door and exactly ten ordered blocks', async () => {
      repository.findById.mockResolvedValue(currentCalendar());
      const saved = captureBlocks();

      const empty = await service.updateDoor(owner, 'calendar-1', 3, { expectedVersion: 4, blocks: [] });
      const tenBlocks = Array.from({ length: 10 }, (_, index) => ({
        position: index + 1,
        type: MinAdventDoorContentType.Text,
        text: `<p>${index}</p>`,
      }));
      await service.updateDoor(owner, 'calendar-1', 3, { expectedVersion: 5, blocks: tenBlocks });

      expect(empty).toEqual({ day: 3, status: MinAdventDoorStatus.Empty, version: 5, completed: false });
      expect(saved[0]).toEqual([]);
      expect(saved[1]).toHaveLength(10);
      expect(repository.replaceDoorBlocks).toHaveBeenCalledTimes(2);
    });

    it('rejects eleven blocks and position gaps as invalid content', async () => {
      repository.findById.mockResolvedValue(currentCalendar());
      captureBlocks();
      const elevenBlocks = Array.from({ length: 11 }, (_, index) => ({
        position: index + 1,
        type: MinAdventDoorContentType.Text,
        text: '<p>Text</p>',
      }));

      await expect(
        service.updateDoor(owner, 'calendar-1', 3, { expectedVersion: 4, blocks: elevenBlocks }),
      ).rejects.toMatchObject({
        response: expect.objectContaining({ code: 'INVALID_CONTENT' }),
      });
      await expect(
        service.updateDoor(owner, 'calendar-1', 3, {
          expectedVersion: 4,
          blocks: [{ position: 2, type: MinAdventDoorContentType.Text, text: '<p>Text</p>' }],
        }),
      ).rejects.toMatchObject({ response: expect.objectContaining({ code: 'INVALID_CONTENT' }) });
    });

    it('sanitizes text and validates visible text, link and voucher content', async () => {
      repository.findById.mockResolvedValue(currentCalendar());
      const saved = captureBlocks();

      await service.updateDoor(owner, 'calendar-1', 3, {
        expectedVersion: 4,
        blocks: [
          {
            position: 1,
            type: MinAdventDoorContentType.Text,
            text: '<p><strong>Hello</strong><script>alert(1)</script></p>',
          },
          { position: 2, type: MinAdventDoorContentType.Link, title: ' Song ', url: 'https://example.org/song' },
          {
            position: 3,
            type: MinAdventDoorContentType.Voucher,
            title: ' Coffee ',
            description: ' A coffee together ',
          },
        ],
      });

      expect(saved[0][0].text).toBe('<p><strong>Hello</strong></p>');
      expect(saved[0][1]).toMatchObject({ title: 'Song', url: 'https://example.org/song' });
      expect(saved[0][2]).toMatchObject({ title: 'Coffee', description: 'A coffee together' });
      await expect(
        service.updateDoor(owner, 'calendar-1', 3, {
          expectedVersion: 4,
          blocks: [{ position: 1, type: MinAdventDoorContentType.Text, text: '<p><br></p>' }],
        }),
      ).rejects.toMatchObject({ response: expect.objectContaining({ code: 'INVALID_CONTENT' }) });
      await expect(
        service.updateDoor(owner, 'calendar-1', 3, {
          expectedVersion: 4,
          blocks: [{ position: 1, type: MinAdventDoorContentType.Link, title: 'Link', url: 'javascript:alert(1)' }],
        }),
      ).rejects.toMatchObject({ response: expect.objectContaining({ code: 'INVALID_CONTENT' }) });
    });

    it('rejects links whose serialized URL exceeds the database column length', async () => {
      repository.findById.mockResolvedValue(currentCalendar());
      captureBlocks();

      await expect(
        service.updateDoor(owner, 'calendar-1', 3, {
          expectedVersion: 4,
          blocks: [
            {
              position: 1,
              type: MinAdventDoorContentType.Link,
              title: 'Unicode URL',
              url: `https://example.org/${'ü'.repeat(400)}`,
            },
          ],
        }),
      ).rejects.toMatchObject({ response: expect.objectContaining({ code: 'INVALID_CONTENT' }) });
    });

    it('rejects content exceeding the updated text, title and voucher description limits', async () => {
      repository.findById.mockResolvedValue(currentCalendar());
      captureBlocks();
      await expect(
        service.updateDoor(owner, 'calendar-1', 3, {
          expectedVersion: 4,
          blocks: [{ position: 1, type: MinAdventDoorContentType.Text, text: `<p>${'a'.repeat(501)}</p>` }],
        }),
      ).rejects.toMatchObject({ response: expect.objectContaining({ code: 'INVALID_CONTENT' }) });
      await expect(
        service.updateDoor(owner, 'calendar-1', 3, {
          expectedVersion: 4,
          blocks: [{ position: 1, type: MinAdventDoorContentType.Link, title: 'T'.repeat(51), url: 'https://a.co' }],
        }),
      ).rejects.toMatchObject({ response: expect.objectContaining({ code: 'INVALID_CONTENT' }) });
      await expect(
        service.updateDoor(owner, 'calendar-1', 3, {
          expectedVersion: 4,
          blocks: [
            { position: 1, type: MinAdventDoorContentType.Voucher, title: 'Voucher', description: 'D'.repeat(201) },
          ],
        }),
      ).rejects.toMatchObject({ response: expect.objectContaining({ code: 'INVALID_CONTENT' }) });
    });
  });
});
