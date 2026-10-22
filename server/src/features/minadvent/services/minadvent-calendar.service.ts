import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Parser } from 'htmlparser2';
import { randomBytes } from 'node:crypto';
import sanitizeHtml from 'sanitize-html';
import { MinFactoryUser } from '../../minfactory/models/domains/minfactory-user';
import { MinAdventDomainMapper } from '../mapper/minadvent-domain.mapper';
import { MinAdventDtoMapper } from '../mapper/minadvent-dto.mapper';
import { MinAdventEntityMapper } from '../mapper/minadvent-entity.mapper';
import { MinAdventDoorContent } from '../models/domains/minadvent-block';
import { MinAdventCalendar } from '../models/domains/minadvent-calendar';
import { MinAdventCalendarCreateDto } from '../models/dtos/minadvent-calendar-create.dto';
import { MinAdventCalendarDeleteDto } from '../models/dtos/minadvent-calendar-delete.dto';
import { MinAdventCalendarUpdateDto } from '../models/dtos/minadvent-calendar-update.dto';
import { MinAdventCalendarDto } from '../models/dtos/minadvent-calendar.dto';
import { MinAdventDoorStatusUpdateDto } from '../models/dtos/minadvent-door-status-update.dto';
import { MinAdventDoorUpdateResponseDto } from '../models/dtos/minadvent-door-update-response.dto';
import { MinAdventDoorUpdateDto } from '../models/dtos/minadvent-door-update.dto';
import { MinAdventSharedCalendarDto } from '../models/dtos/minadvent-shared-calendar.dto';
import { MinAdventSharedDoorContentDto } from '../models/dtos/minadvent-shared-door-content.dto';
import { MinAdventSharedDoorOpenResponseDto } from '../models/dtos/minadvent-shared-door-open-response.dto';
import { MinAdventSharedDoorOpenDto } from '../models/dtos/minadvent-shared-door-open.dto';
import { MinAdventSharingResponseDto } from '../models/dtos/minadvent-sharing-response.dto';
import { MinAdventSharingUpdateDto } from '../models/dtos/minadvent-sharing-update.dto';
import { MinAdventTokenRotationDto } from '../models/dtos/minadvent-token-rotation.dto';
import { MinAdventDoorContentType } from '../models/enums/minadvent-door-content-type.enum';
import { MinAdventDoorStatus } from '../models/enums/minadvent-door-status.enum';
import { MinAdventCalendarRepository } from '../repositories/minadvent-calendar.repository';

@Injectable()
export class MinAdventCalendarService {
  constructor(private readonly calendarRepository: MinAdventCalendarRepository) {}

  public async create(user: MinFactoryUser, input: MinAdventCalendarCreateDto): Promise<MinAdventCalendarDto> {
    this.validateCreate(input);
    const domain = MinAdventDtoMapper.toDomain(input, user.id);
    return MinAdventDomainMapper.toDto(MinAdventEntityMapper.toDomain(await this.calendarRepository.create(domain)));
  }

  public async delete(user: MinFactoryUser, id: string, input: MinAdventCalendarDeleteDto): Promise<void> {
    await this.calendarRepository.delete(user.id, id, input.expectedVersion);
  }

  public async get(user: MinFactoryUser, id: string): Promise<MinAdventCalendarDto> {
    return MinAdventDomainMapper.toDto(await this.requireOwnedCalendar(user, id));
  }

  public async getSharedCalendar(token: string): Promise<MinAdventSharedCalendarDto | null> {
    if (!/^[a-f0-9]{64}$/.test(token)) {
      return null;
    }
    const entity = await this.calendarRepository.findByActiveToken(token);
    if (!entity) {
      return null;
    }
    const calendar = MinAdventEntityMapper.toDomain(entity);
    const response = new MinAdventSharedCalendarDto();
    response.title = calendar.title;
    response.recipientName = calendar.recipient;
    response.year = calendar.year;
    response.version = calendar.version;
    response.completed = calendar.completed;
    response.doors = calendar.doors.map((door) => ({ day: door.day, status: door.status }));
    return response;
  }

  public async getSharedDoor(token: string, day: number): Promise<MinAdventSharedDoorContentDto | null> {
    if (!Number.isInteger(day) || day < 1 || day > 24) {
      throw new BadRequestException('Day must be an integer between 1 and 24.');
    }
    if (!/^[a-f0-9]{64}$/.test(token)) {
      return null;
    }
    const entity = await this.calendarRepository.getSharedDoor(token, day);
    if (!entity) {
      return null;
    }
    const calendar = MinAdventEntityMapper.toDomain(entity);
    const door = calendar.doors[0];
    if (!door || door.status !== MinAdventDoorStatus.Opened) {
      throw new ConflictException({ code: 'DOOR_NOT_OPENED', message: 'Dieses Türchen wurde noch nicht geöffnet.' });
    }
    const response = new MinAdventSharedDoorContentDto();
    response.day = door.day;
    response.status = door.status;
    response.blocks = door.contents.map(MinAdventDomainMapper.toBlockDto);
    return response;
  }

  public async getSharing(user: MinFactoryUser, id: string): Promise<MinAdventSharingResponseDto> {
    return this.toSharingResponse(await this.requireOwnedCalendar(user, id));
  }

  public async list(user: MinFactoryUser): Promise<MinAdventCalendarDto[]> {
    const calendars = (await this.calendarRepository.findByOwner(user.id)).map(MinAdventEntityMapper.toDomain);
    const currentYear = this.getCurrentBerlinYear();
    calendars.sort((left, right) => {
      if (left.year === currentYear) {
        return right.year === currentYear ? 0 : -1;
      }
      if (right.year === currentYear) {
        return 1;
      }
      return right.year - left.year || right.createdAt.getTime() - left.createdAt.getTime();
    });
    return calendars.map(MinAdventDomainMapper.toDto);
  }

  public async openSharedDoor(
    token: string,
    day: number,
    input: MinAdventSharedDoorOpenDto,
  ): Promise<MinAdventSharedDoorOpenResponseDto | null> {
    if (!Number.isInteger(day) || day < 1 || day > 24) {
      throw new BadRequestException('Day must be an integer between 1 and 24.');
    }
    if (!/^[a-f0-9]{64}$/.test(token)) {
      return null;
    }
    const now = Object.fromEntries(
      new Intl.DateTimeFormat('en', { timeZone: 'Europe/Berlin', year: 'numeric', month: 'numeric', day: 'numeric' })
        .formatToParts(new Date())
        .map((part) => [part.type, Number(part.value)]),
    );
    try {
      const result = await this.calendarRepository.openSharedDoor(token, day, input.expectedVersion, {
        year: now['year'],
        month: now['month'],
        day: now['day'],
      });
      const calendar = MinAdventEntityMapper.toDomain(result.calendar);
      const door = calendar.doors.find((item) => item.day === day);
      if (!door) {
        throw new NotFoundException('Door not found.');
      }
      const response = new MinAdventSharedDoorOpenResponseDto();
      response.day = door.day;
      response.status = door.status;
      response.version = calendar.version;
      response.completed = calendar.completed;
      response.firstOpened = result.firstOpened;
      response.blocks = door.contents.map(MinAdventDomainMapper.toBlockDto);
      return response;
    } catch (error) {
      if (error instanceof NotFoundException) {
        return null;
      }
      throw error;
    }
  }

  public async rotateSharingToken(
    user: MinFactoryUser,
    id: string,
    input: MinAdventTokenRotationDto,
  ): Promise<MinAdventSharingResponseDto> {
    const current = await this.requireOwnedCalendar(user, id);
    if (current.version !== input.expectedVersion) {
      throw new ConflictException({
        code: 'VERSION_CONFLICT',
        message: 'Der Kalender wurde zwischenzeitlich geändert.',
      });
    }
    if (!current.shared) {
      throw new ConflictException({ code: 'CALENDAR_NOT_PUBLISHED', message: 'Der Kalender ist nicht freigegeben.' });
    }
    const updated = MinAdventEntityMapper.toDomain(
      await this.calendarRepository.updateSharing(user.id, id, input.expectedVersion, true, this.createToken()),
    );
    return this.toSharingResponse(updated);
  }

  public async update(
    user: MinFactoryUser,
    id: string,
    input: MinAdventCalendarUpdateDto,
  ): Promise<MinAdventCalendarDto> {
    if (input.expectedVersion === undefined || (!input.title && !input.recipientName)) {
      throw new BadRequestException('At least one of title or recipientName is required.');
    }
    if (input.title !== undefined && (!input.title.trim() || input.title.trim().length > 50)) {
      throw new BadRequestException('Title must contain 1 to 50 characters.');
    }
    if (input.recipientName !== undefined && (!input.recipientName.trim() || input.recipientName.trim().length > 50)) {
      throw new BadRequestException('Recipient name must contain 1 to 50 characters.');
    }
    const calendar = await this.requireOwnedCalendar(user, id);
    if (input.expectedVersion !== calendar.version) {
      throw new ConflictException({
        code: 'VERSION_CONFLICT',
        message: 'Der Kalender wurde zwischenzeitlich geändert.',
      });
    }
    const updatedDomain = MinAdventDtoMapper.applyMetadataUpdate(input, calendar);
    if (updatedDomain.title === calendar.title && updatedDomain.recipient === calendar.recipient) {
      return MinAdventDomainMapper.toDto(calendar);
    }
    updatedDomain.version += 1;
    const updated = await this.calendarRepository.update(updatedDomain, input.expectedVersion);
    return MinAdventDomainMapper.toDto(MinAdventEntityMapper.toDomain(updated));
  }

  public async updateDoor(
    user: MinFactoryUser,
    id: string,
    day: number,
    input: MinAdventDoorUpdateDto,
  ): Promise<MinAdventDoorUpdateResponseDto> {
    if (!Number.isInteger(day) || day < 1 || day > 24) {
      throw new BadRequestException('Day must be an integer between 1 and 24.');
    }
    await this.requireOwnedCalendar(user, id);
    const updatedEntity = await this.calendarRepository.replaceDoorBlocks(user.id, id, day, input.expectedVersion, () =>
      this.validateAndMapBlocks(input.blocks),
    );
    const updatedCalendar = MinAdventEntityMapper.toDomain(updatedEntity);
    const updatedDoor = updatedCalendar.doors.find((door) => door.day === day);
    if (!updatedDoor) {
      throw new NotFoundException('Door not found.');
    }
    return MinAdventDomainMapper.toDoorUpdateResponse(updatedDoor, updatedCalendar);
  }

  public async updateDoorStatus(
    user: MinFactoryUser,
    id: string,
    day: number,
    input: MinAdventDoorStatusUpdateDto,
  ): Promise<MinAdventDoorUpdateResponseDto> {
    if (!Number.isInteger(day) || day < 1 || day > 24) {
      throw new BadRequestException('Day must be an integer between 1 and 24.');
    }
    await this.requireOwnedCalendar(user, id);
    const updatedEntity = await this.calendarRepository.closeDoor(user.id, id, day, input.expectedVersion);
    const updatedCalendar = MinAdventEntityMapper.toDomain(updatedEntity);
    const updatedDoor = updatedCalendar.doors.find((door) => door.day === day);
    if (!updatedDoor) {
      throw new NotFoundException('Door not found.');
    }
    return MinAdventDomainMapper.toDoorUpdateResponse(updatedDoor, updatedCalendar);
  }

  public async updateSharing(
    user: MinFactoryUser,
    id: string,
    input: MinAdventSharingUpdateDto,
  ): Promise<MinAdventSharingResponseDto> {
    const current = await this.requireOwnedCalendar(user, id);
    if (current.version !== input.expectedVersion) {
      throw new ConflictException({
        code: 'VERSION_CONFLICT',
        message: 'Der Kalender wurde zwischenzeitlich geändert.',
      });
    }
    if (current.shared === input.published) {
      return this.toSharingResponse(current);
    }
    const token = input.published ? this.createToken() : null;
    const updated = MinAdventEntityMapper.toDomain(
      await this.calendarRepository.updateSharing(user.id, id, input.expectedVersion, input.published, token),
    );
    return this.toSharingResponse(updated);
  }

  private countVisibleCharacters(html: string): number {
    let visibleText = '';
    const parser = new Parser({ ontext: (text) => (visibleText += text) }, { decodeEntities: true });
    parser.end(html);
    return [...visibleText.replaceAll('\u00a0', ' ').trim()].length;
  }

  private createToken(): string {
    return randomBytes(32).toString('hex');
  }

  private getCurrentBerlinYear(): number {
    return Number(new Intl.DateTimeFormat('en', { timeZone: 'Europe/Berlin', year: 'numeric' }).format(new Date()));
  }

  private mapLink(input: MinAdventDoorUpdateDto['blocks'][number], block: MinAdventDoorContent): void {
    if (typeof input.url !== 'string' || input.url.length > 50) {
      this.throwInvalidContent();
    }
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(input.url.trim());
    } catch {
      this.throwInvalidContent();
    }
    if (!['http:', 'https:'].includes(parsedUrl.protocol) || !parsedUrl.hostname) {
      this.throwInvalidContent();
    }
    const serializedUrl = parsedUrl.toString();
    if (serializedUrl.length > 50) {
      this.throwInvalidContent();
    }
    block.title = this.validateTitleAndTrim(input.title);
    block.url = serializedUrl;
  }

  private mapVoucher(input: MinAdventDoorUpdateDto['blocks'][number], block: MinAdventDoorContent): void {
    if (typeof input.description !== 'string' || !input.description.trim() || input.description.length > 200) {
      this.throwInvalidContent();
    }
    block.title = this.validateTitleAndTrim(input.title);
    block.description = input.description.trim();
  }

  private async requireOwnedCalendar(user: MinFactoryUser, id: string): Promise<MinAdventCalendar> {
    const calendar = await this.calendarRepository.findById(id);
    if (!calendar) {
      throw new NotFoundException('Calendar not found.');
    }
    const domain = MinAdventEntityMapper.toDomain(calendar);
    if (domain.ownerId !== user.id) {
      throw new ForbiddenException('You do not own this calendar.');
    }
    return domain;
  }

  private sanitizeText(text: string | null | undefined): string {
    if (typeof text !== 'string') {
      this.throwInvalidContent();
    }
    const sanitized = sanitizeHtml(text, {
      allowedTags: ['p', 'br', 'strong', 'b', 'em', 'i', 'ul', 'ol', 'li'],
      allowedAttributes: {},
      disallowedTagsMode: 'discard',
      nonTextTags: ['script', 'style', 'textarea', 'option'],
    });
    const visibleCharacters = this.countVisibleCharacters(sanitized);
    if (visibleCharacters < 1 || visibleCharacters > 500) {
      this.throwInvalidContent();
    }
    return sanitized;
  }

  private throwInvalidContent(): never {
    throw new ConflictException({ code: 'INVALID_CONTENT', message: 'Die Türcheninhalte sind ungültig.' });
  }

  private toSharingResponse(calendar: MinAdventCalendar): MinAdventSharingResponseDto {
    const response = new MinAdventSharingResponseDto();
    response.published = calendar.shared;
    response.version = calendar.version;
    response.completed = calendar.completed;
    if (calendar.shareToken) {
      response.sharedUrl = `/minadvent/shared/${calendar.shareToken}`;
    }
    return response;
  }

  private validateAndMapBlock(input: MinAdventDoorUpdateDto['blocks'][number], index: number): MinAdventDoorContent {
    if (input?.position !== index + 1 || !Object.values(MinAdventDoorContentType).includes(input.type)) {
      this.throwInvalidContent();
    }
    const block = new MinAdventDoorContent();
    block.position = input.position;
    block.type = input.type;
    if (input.type === MinAdventDoorContentType.Text) {
      block.text = this.sanitizeText(input.text);
    } else if (input.type === MinAdventDoorContentType.Link) {
      this.mapLink(input, block);
    } else {
      this.mapVoucher(input, block);
    }
    return block;
  }

  private validateAndMapBlocks(inputs: MinAdventDoorUpdateDto['blocks']): MinAdventDoorContent[] {
    if (!Array.isArray(inputs) || inputs.length > 10) {
      this.throwInvalidContent();
    }
    return inputs.map((input, index) => this.validateAndMapBlock(input, index));
  }

  private validateCreate(input: MinAdventCalendarCreateDto): void {
    if (!input.title?.trim() || input.title.length > 50) {
      throw new BadRequestException('Title must contain 1 to 50 characters.');
    }
    if (!input.recipientName?.trim() || input.recipientName.length > 50) {
      throw new BadRequestException('Recipient name must contain 1 to 50 characters.');
    }
    if (!Number.isInteger(input.year) || input.year < 1 || input.year > 9999) {
      throw new BadRequestException('Year must be an integer between 1 and 9999.');
    }
  }

  private validateTitleAndTrim(title: string | null | undefined): string {
    if (typeof title !== 'string' || !title.trim() || title.trim().length > 50) {
      this.throwInvalidContent();
    }
    return title.trim();
  }
}
