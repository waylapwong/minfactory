import { ConflictException, ForbiddenException } from '@nestjs/common';
import { MinFactoryUser } from '../../minfactory/models/domains/minfactory-user';
import { MinAdventCalendarRepositoryMock } from '../mocks/minadvent-calendar.repository.mock';
import { MinAdventCalendarEntity } from '../models/entities/minadvent-calendar.entity';
import { MinAdventDoorEntity } from '../models/entities/minadvent-door.entity';
import { MinAdventDoorStatus } from '../models/enums/minadvent-door-status.enum';
import { MinAdventBlockType } from '../models/enums/minadvent-block-type.enum';
import { MinAdventBlock } from '../models/domains/minadvent-block';
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

    const captureBlocks = (): MinAdventBlock[][] => {
      const saved: MinAdventBlock[][] = [];
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
        type: MinAdventBlockType.Text,
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
        type: MinAdventBlockType.Text,
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
          blocks: [{ position: 2, type: MinAdventBlockType.Text, text: '<p>Text</p>' }],
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
            type: MinAdventBlockType.Text,
            text: '<p><strong>Hello</strong><script>alert(1)</script></p>',
          },
          { position: 2, type: MinAdventBlockType.Link, title: ' Song ', url: 'https://example.org/song' },
          { position: 3, type: MinAdventBlockType.Voucher, title: ' Coffee ', description: ' A coffee together ' },
        ],
      });

      expect(saved[0][0].text).toBe('<p><strong>Hello</strong></p>');
      expect(saved[0][1]).toMatchObject({ title: 'Song', url: 'https://example.org/song' });
      expect(saved[0][2]).toMatchObject({ title: 'Coffee', description: 'A coffee together' });
      await expect(
        service.updateDoor(owner, 'calendar-1', 3, {
          expectedVersion: 4,
          blocks: [{ position: 1, type: MinAdventBlockType.Text, text: '<p><br></p>' }],
        }),
      ).rejects.toMatchObject({ response: expect.objectContaining({ code: 'INVALID_CONTENT' }) });
      await expect(
        service.updateDoor(owner, 'calendar-1', 3, {
          expectedVersion: 4,
          blocks: [{ position: 1, type: MinAdventBlockType.Link, title: 'Link', url: 'javascript:alert(1)' }],
        }),
      ).rejects.toMatchObject({ response: expect.objectContaining({ code: 'INVALID_CONTENT' }) });
    });
  });
});
