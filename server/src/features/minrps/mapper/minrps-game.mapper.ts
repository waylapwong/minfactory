import { MinRpsGame } from '../models/domain/minrps-game';
import { MinRpsGameRequestDto } from '../models/dtos/minrps-game-request';
import { MinRpsGameResponseDto } from '../models/dtos/minrps-game-response.dto';
import { MinRpsGameEntity } from '../models/entities/minrps-game.entity';

export class MinRpsGameMapper {
  public static toDomainFromDto(dto: MinRpsGameRequestDto): MinRpsGame {
    const domain: MinRpsGame = new MinRpsGame(dto.name);
    return domain;
  }

  public static toDomainFromEntity(entity: MinRpsGameEntity): MinRpsGame {
    const domain: MinRpsGame = new MinRpsGame(entity.name);
    domain.createdAt = entity.createdAt;
    domain.id = entity.id;
    domain.name = entity.name;
    return domain;
  }

  public static toDtoFromEntity(entity: MinRpsGameEntity): MinRpsGameResponseDto {
    const domain: MinRpsGame = MinRpsGameMapper.toDomainFromEntity(entity);
    return MinRpsGameMapper.toDtofromDomain(domain);
  }

  public static toDtofromDomain(domain: MinRpsGame): MinRpsGameResponseDto {
    const dto: MinRpsGameResponseDto = new MinRpsGameResponseDto();
    dto.createdAt = domain.createdAt;
    dto.id = domain.id;
    dto.name = domain.name;
    return dto;
  }

  public static toEntityFromDomain(domain: MinRpsGame): MinRpsGameEntity {
    const entity: MinRpsGameEntity = new MinRpsGameEntity();
    entity.createdAt = domain.createdAt;
    entity.id = domain.id;
    entity.name = domain.name;
    return entity;
  }

  public static toEntityFromDto(dto: MinRpsGameRequestDto): MinRpsGameEntity {
    const domain: MinRpsGame = MinRpsGameMapper.toDomainFromDto(dto);
    return MinRpsGameMapper.toEntityFromDomain(domain);
  }
}
