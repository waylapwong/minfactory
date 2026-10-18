import { ConflictException, ForbiddenException } from '@nestjs/common';
import { MinFactoryUser } from '../../minfactory/models/domains/minfactory-user';
import { MinAdventCalendarEntity } from '../models/entities/minadvent-calendar.entity';
import { MinAdventDoorStatus } from '../models/entities/minadvent-door.entity';
import { MinAdventCalendarRepositoryMock } from '../mocks/minadvent-calendar.repository.mock';
import { MinAdventCalendarService } from './minadvent-calendar.service';

describe('MinAdventCalendarService', () => {
  let service: MinAdventCalendarService;
  let repository: MinAdventCalendarRepositoryMock;
  const owner = { id: 'owner-1' } as MinFactoryUser;

  beforeEach(() => {
    repository = new MinAdventCalendarRepositoryMock();
    service = new MinAdventCalendarService(repository as never);
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
      day: index + 1,
      status: MinAdventDoorStatus.Empty,
    })) as MinAdventCalendarEntity['doors'];
    repository.create.mockResolvedValue(calendar);

    const result = await service.create(owner, { title: 'December', recipientName: 'Alex', year: 1901 });

    expect(repository.create).toHaveBeenCalledWith(expect.objectContaining({ ownerId: owner.id, year: 1901 }));
    expect(result.doors).toHaveLength(24);
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
});
