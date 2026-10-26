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
import { MinAdventBlock } from '../models/domains/minadvent-block';
import { MinAdventCalendar } from '../models/domains/minadvent-calendar';
import { MinAdventDoor } from '../models/domains/minadvent-door';
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
import { MinAdventCalendarEntity } from '../models/entities/minadvent-calendar.entity';
import { MinAdventBlockType } from '../models/enums/minadvent-block-type.enum';
import { MinAdventDoorStatus } from '../models/enums/minadvent-door-status.enum';
import { MinAdventCalendarRepository } from '../repositories/minadvent-calendar.repository';

@Injectable()
export class MinAdventCalendarService {
  constructor(private readonly calendarRepository: MinAdventCalendarRepository) {}

  public async create(user: MinFactoryUser, dto: MinAdventCalendarCreateDto): Promise<MinAdventCalendarDto> {
    const domain: MinAdventCalendar = MinAdventDtoMapper.toDomain(dto, user.id);
    const entity: MinAdventCalendarEntity = MinAdventDomainMapper.toEntity(domain);
    const createdEntity: MinAdventCalendarEntity = await this.calendarRepository.create(entity);
    const createdDomain: MinAdventCalendar = MinAdventEntityMapper.toDomain(createdEntity);
    return MinAdventDomainMapper.toDto(createdDomain);
  }

  public async delete(user: MinFactoryUser, id: string, input: MinAdventCalendarDeleteDto): Promise<void> {
    const domain: MinAdventCalendar = await this.requireOwnedCalendar(user, id);
    if (domain.version !== input.expectedVersion) {
      throw new ConflictException({
        code: 'VERSION_CONFLICT',
        message: 'Der Kalender wurde zwischenzeitlich geändert.',
      });
    }
    await this.calendarRepository.delete(MinAdventDomainMapper.toEntity(domain));
  }

  public async get(user: MinFactoryUser, calendarId: string): Promise<MinAdventCalendarDto> {
    const calender: MinAdventCalendar = await this.requireOwnedCalendar(user, calendarId);
    return MinAdventDomainMapper.toDto(calender);
  }

  public async getSharedCalendar(token: string): Promise<MinAdventSharedCalendarDto | null> {
    if (!/^[a-f0-9]{64}$/.test(token)) {
      return null;
    }
    const entity: MinAdventCalendarEntity | null = await this.calendarRepository.findByActiveToken(token);
    if (!entity) {
      return null;
    }
    const calendar: MinAdventCalendar = MinAdventEntityMapper.toDomain(entity);
    const response: MinAdventSharedCalendarDto = new MinAdventSharedCalendarDto();
    response.title = calendar.title;
    response.recipientName = calendar.recipientName;
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
    const entity: MinAdventCalendarEntity | null = await this.calendarRepository.getSharedDoor(token, day);
    if (!entity) {
      return null;
    }
    const calendar: MinAdventCalendar = MinAdventEntityMapper.toDomain(entity);
    const door: MinAdventDoor = calendar.doors[0];
    if (door?.status !== MinAdventDoorStatus.Opened) {
      throw new ConflictException({ code: 'DOOR_NOT_OPENED', message: 'Dieses Türchen wurde noch nicht geöffnet.' });
    }
    const response: MinAdventSharedDoorContentDto = new MinAdventSharedDoorContentDto();
    response.day = door.day;
    response.status = door.status;
    response.blocks = door.blocks.map(MinAdventDomainMapper.toBlockDto);
    return response;
  }

  public async getSharing(user: MinFactoryUser, id: string): Promise<MinAdventSharingResponseDto> {
    return this.toSharingResponse(await this.requireOwnedCalendar(user, id));
  }

  public async list(user: MinFactoryUser): Promise<MinAdventCalendarDto[]> {
    const calendarEntities: MinAdventCalendarEntity[] = await this.calendarRepository.findByOwner(user.id);
    const calendars: MinAdventCalendar[] = calendarEntities.map((entity) => MinAdventEntityMapper.toDomain(entity));
    const currentYear: number = this.getCurrentBerlinYear();

    calendars.sort((left, right) => {
      if (left.year === currentYear) {
        return right.year === currentYear ? 0 : -1;
      }
      if (right.year === currentYear) {
        return 1;
      }
      return right.year - left.year || right.createdAt.getTime() - left.createdAt.getTime();
    });

    const calendarDtos: MinAdventCalendarDto[] = calendars.map((calendar) => MinAdventDomainMapper.toDto(calendar));
    return calendarDtos;
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
    const entity: MinAdventCalendarEntity | null = await this.calendarRepository.getSharedDoor(token, day);
    if (!entity) {
      return null;
    }
    if (entity.version !== input.expectedVersion) {
      throw new ConflictException({
        code: 'VERSION_CONFLICT',
        message: 'Der Kalender wurde zwischenzeitlich geändert.',
      });
    }
    const currentCalendar: MinAdventCalendar = MinAdventEntityMapper.toDomain(entity);
    const currentDoor: MinAdventDoor | undefined = currentCalendar.doors.find((item) => item.day === day);
    if (!currentDoor) {
      throw new NotFoundException('Door not found.');
    }
    const firstOpened: boolean = currentDoor.status === MinAdventDoorStatus.Filled;
    const now: { [k: string]: number } = Object.fromEntries(
      new Intl.DateTimeFormat('en', { timeZone: 'Europe/Berlin', year: 'numeric', month: 'numeric', day: 'numeric' })
        .formatToParts(new Date())
        .map((part) => [part.type, Number(part.value)]),
    );
    try {
      const openedEntity: MinAdventCalendarEntity = await this.calendarRepository.openSharedDoor(entity, day, {
        year: now['year'],
        month: now['month'],
        day: now['day'],
      });
      const calendar: MinAdventCalendar = MinAdventEntityMapper.toDomain(openedEntity);
      const door: MinAdventDoor | undefined = calendar.doors.find((item) => item.day === day);
      if (!door) {
        throw new NotFoundException('Door not found.');
      }
      const response: MinAdventSharedDoorOpenResponseDto = new MinAdventSharedDoorOpenResponseDto();
      response.day = door.day;
      response.status = door.status;
      response.version = calendar.version;
      response.completed = calendar.completed;
      response.firstOpened = firstOpened;
      response.blocks = door.blocks.map(MinAdventDomainMapper.toBlockDto);
      return response;
    } catch (error: unknown) {
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
    const current: MinAdventCalendar = await this.requireOwnedCalendar(user, id);
    if (current.version !== input.expectedVersion) {
      throw new ConflictException({
        code: 'VERSION_CONFLICT',
        message: 'Der Kalender wurde zwischenzeitlich geändert.',
      });
    }
    if (!current.isPublished) {
      throw new ConflictException({ code: 'CALENDAR_NOT_PUBLISHED', message: 'Der Kalender ist nicht freigegeben.' });
    }
    const updatedEntity: MinAdventCalendarEntity = MinAdventDomainMapper.toEntity(current);
    updatedEntity.activeToken = this.createToken();
    const updated: MinAdventCalendar = MinAdventEntityMapper.toDomain(
      await this.calendarRepository.updateSharing(updatedEntity),
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
    const calendar: MinAdventCalendar = await this.requireOwnedCalendar(user, id);
    if (input.expectedVersion !== calendar.version) {
      throw new ConflictException({
        code: 'VERSION_CONFLICT',
        message: 'Der Kalender wurde zwischenzeitlich geändert.',
      });
    }
    if (calendar.completed) {
      throw new ConflictException({
        code: 'CALENDAR_COMPLETED',
        message: 'Abgeschlossene Kalender können nicht mehr bearbeitet werden.',
      });
    }
    const updatedDomain: MinAdventCalendar = MinAdventDtoMapper.applyMetadataUpdate(input, calendar);
    if (updatedDomain.title === calendar.title && updatedDomain.recipientName === calendar.recipientName) {
      return MinAdventDomainMapper.toDto(calendar);
    }
    updatedDomain.version += 1;
    const updateEntity: MinAdventCalendarEntity = MinAdventDomainMapper.toEntity(updatedDomain);
    const updated: MinAdventCalendarEntity = await this.calendarRepository.update(updateEntity);
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
    const calendar: MinAdventCalendar = await this.requireOwnedCalendar(user, id);
    this.validateExpectedVersion(calendar, input.expectedVersion);
    if (calendar.completed) {
      throw new ConflictException({
        code: 'CALENDAR_COMPLETED',
        message: 'Abgeschlossene Kalender können nicht mehr bearbeitet werden.',
      });
    }
    const door: MinAdventDoor | undefined = calendar.doors.find((item) => item.day === day);
    if (!door) {
      throw new NotFoundException('Door not found.');
    }
    if (door.status === MinAdventDoorStatus.Opened) {
      throw new ConflictException({
        code: 'DOOR_OPENED',
        message: 'Geöffnete Türchen können nicht bearbeitet werden.',
      });
    }
    door.blocks = this.validateAndMapBlocks(input.blocks);
    const entity: MinAdventCalendarEntity = MinAdventDomainMapper.toEntity(calendar);
    const updatedEntity: MinAdventCalendarEntity = await this.calendarRepository.replaceDoorBlocks(entity, day);
    const updatedCalendar: MinAdventCalendar = MinAdventEntityMapper.toDomain(updatedEntity);
    const updatedDoor: MinAdventDoor | undefined = updatedCalendar.doors.find((door) => door.day === day);
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
    const calendar: MinAdventCalendar = await this.requireOwnedCalendar(user, id);
    this.validateExpectedVersion(calendar, input.expectedVersion);
    if (calendar.completed) {
      throw new ConflictException({
        code: 'CALENDAR_COMPLETED',
        message: 'Abgeschlossene Kalender können nicht mehr bearbeitet werden.',
      });
    }
    const entity: MinAdventCalendarEntity = MinAdventDomainMapper.toEntity(calendar);
    const updatedEntity: MinAdventCalendarEntity = await this.calendarRepository.closeDoor(entity, day);
    const updatedCalendar: MinAdventCalendar = MinAdventEntityMapper.toDomain(updatedEntity);
    const updatedDoor: MinAdventDoor | undefined = updatedCalendar.doors.find((door) => door.day === day);
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
    const current: MinAdventCalendar = await this.requireOwnedCalendar(user, id);
    if (current.version !== input.expectedVersion) {
      throw new ConflictException({
        code: 'VERSION_CONFLICT',
        message: 'Der Kalender wurde zwischenzeitlich geändert.',
      });
    }
    if (current.isPublished === input.published) {
      return this.toSharingResponse(current);
    }
    const entity: MinAdventCalendarEntity = MinAdventDomainMapper.toEntity(current);
    entity.isPublished = input.published;
    entity.activeToken = input.published ? this.createToken() : null;
    const updated: MinAdventCalendar = MinAdventEntityMapper.toDomain(
      await this.calendarRepository.updateSharing(entity),
    );
    return this.toSharingResponse(updated);
  }

  private countVisibleCharacters(html: string): number {
    let visibleText: string = '';
    const parser: Parser = new Parser({ ontext: (text) => (visibleText += text) }, { decodeEntities: true });
    parser.end(html);
    return [...visibleText.replaceAll('\u00a0', ' ').trim()].length;
  }

  private createToken(): string {
    return randomBytes(32).toString('hex');
  }

  private getCurrentBerlinYear(): number {
    return Number(new Intl.DateTimeFormat('en', { timeZone: 'Europe/Berlin', year: 'numeric' }).format(new Date()));
  }

  private mapLink(input: MinAdventDoorUpdateDto['blocks'][number], block: MinAdventBlock): void {
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
    const serializedUrl: string = parsedUrl.toString();
    if (serializedUrl.length > 50) {
      this.throwInvalidContent();
    }
    block.title = this.validateTitleAndTrim(input.title);
    block.url = serializedUrl;
  }

  private mapVoucher(input: MinAdventDoorUpdateDto['blocks'][number], block: MinAdventBlock): void {
    if (typeof input.description !== 'string' || !input.description.trim() || input.description.length > 200) {
      this.throwInvalidContent();
    }
    block.title = this.validateTitleAndTrim(input.title);
    block.description = input.description.trim();
  }

  private async requireOwnedCalendar(user: MinFactoryUser, calendarId: string): Promise<MinAdventCalendar> {
    const entity: MinAdventCalendarEntity | null = await this.calendarRepository.findById(calendarId);
    if (!entity) {
      throw new NotFoundException('Calendar not found.');
    }
    const domain: MinAdventCalendar = MinAdventEntityMapper.toDomain(entity);
    if (domain.ownerId !== user.id) {
      throw new ForbiddenException('You do not own this calendar.');
    }
    return domain;
  }

  private sanitizeText(text: string | null | undefined): string {
    if (typeof text !== 'string') {
      this.throwInvalidContent();
    }
    const sanitized: string = sanitizeHtml(text, {
      allowedTags: ['p', 'br', 'strong', 'b', 'em', 'i', 'ul', 'ol', 'li'],
      allowedAttributes: {},
      disallowedTagsMode: 'discard',
      nonTextTags: ['script', 'style', 'textarea', 'option'],
    });
    const visibleCharacters: number = this.countVisibleCharacters(sanitized);
    if (visibleCharacters < 1 || visibleCharacters > 500) {
      this.throwInvalidContent();
    }
    return sanitized;
  }

  private throwInvalidContent(): never {
    throw new ConflictException({ code: 'INVALID_CONTENT', message: 'Die Türcheninhalte sind ungültig.' });
  }

  private toSharingResponse(calendar: MinAdventCalendar): MinAdventSharingResponseDto {
    const response: MinAdventSharingResponseDto = new MinAdventSharingResponseDto();
    response.published = calendar.isPublished;
    response.version = calendar.version;
    response.completed = calendar.completed;
    if (calendar.activeToken) {
      response.sharedUrl = `/minadvent/shared/${calendar.activeToken}`;
    }
    return response;
  }

  private validateAndMapBlock(input: MinAdventDoorUpdateDto['blocks'][number], index: number): MinAdventBlock {
    if (input?.position !== index + 1 || !Object.values(MinAdventBlockType).includes(input.type)) {
      this.throwInvalidContent();
    }
    const block: MinAdventBlock = new MinAdventBlock();
    block.position = input.position;
    block.type = input.type;
    if (input.type === MinAdventBlockType.Text) {
      block.text = this.sanitizeText(input.text);
    } else if (input.type === MinAdventBlockType.Link) {
      this.mapLink(input, block);
    } else {
      this.mapVoucher(input, block);
    }
    return block;
  }

  private validateAndMapBlocks(inputs: MinAdventDoorUpdateDto['blocks']): MinAdventBlock[] {
    if (!Array.isArray(inputs) || inputs.length > 10) {
      this.throwInvalidContent();
    }
    return inputs.map((input, index) => this.validateAndMapBlock(input, index));
  }

  private validateExpectedVersion(calendar: MinAdventCalendar, expectedVersion: number): void {
    if (calendar.version !== expectedVersion) {
      throw new ConflictException({
        code: 'VERSION_CONFLICT',
        message: 'Der Kalender wurde zwischenzeitlich geändert.',
      });
    }
  }

  private validateTitleAndTrim(title: string | null | undefined): string {
    if (typeof title !== 'string' || !title.trim() || title.trim().length > 50) {
      this.throwInvalidContent();
    }
    return title.trim();
  }
}
