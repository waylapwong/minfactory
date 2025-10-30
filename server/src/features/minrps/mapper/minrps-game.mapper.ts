import { MinRpsGame } from '../models/domain/minrps-game';
import { MinRPSGameRequestDto } from '../models/dtos/minrps-game-request';
import { MinRpsGameResponseDto } from '../models/dtos/minrps-game-response.dto';
import { MinRpsGameEntity } from '../models/entities/minrps-game.entity';

export class MinRPSGameMapper {
  public static toDomainFromDto(dto: MinRPSGameRequestDto): MinRpsGame {
    const domain: MinRpsGame = new MinRpsGame();
    domain.name = dto.name;
    return domain;
  }

  public static toDomainFromEntity(entity: MinRpsGameEntity): MinRpsGame {
    const domain: MinRpsGame = new MinRpsGame();
    domain.createdAt = entity.createdAt;
    domain.id = entity.id;
    domain.name = entity.name;
    return domain;
  }

  public static toDtoFromEntity(entity: MinRpsGameEntity): MinRpsGameResponseDto {
    const domain: MinRpsGame = MinRPSGameMapper.toDomainFromEntity(entity);
    return MinRPSGameMapper.toDtofromDomain(domain);
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
    entity.id = domain.id;
    entity.name = domain.name;
    return entity;
  }

  public static toEntityFromDto(dto: MinRPSGameRequestDto): MinRpsGameEntity {
    const domain: MinRpsGame = MinRPSGameMapper.toDomainFromDto(dto);
    return MinRPSGameMapper.toEntityFromDomain(domain);
  }
}
