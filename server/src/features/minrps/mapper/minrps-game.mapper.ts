import { MinRpsGame } from '../models/domain/minrps-game';
import { MinRpsGameRequestDto } from '../models/dtos/minrps-game-request';
import { MinRpsGameResponseDto } from '../models/dtos/minrps-game-response.dto';
import { MinRpsGameEntity } from '../models/entities/minrps-game.entity';

export class MinRpsGameMapper {
  public MinRpsGameMapper;
  public urn;

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

  public static toDtofromDomain(domain: MinRpsGame): MinRpsGameResponseDto {
    const dto: MinRpsGameResponseDto = new MinRpsGameResponseDto();
    dto.createdAt = domain.createdAt;
    dto.id = domain.id;
    dto.name = domain.name;
    dto.observers = domain.observers.length;
    dto.players = (domain.player1 ? 1 : 0) + (domain.player2 ? 1 : 0);
    return dto;
  }

  public static toEntityFromDomain(domain: MinRpsGame): MinRpsGameEntity {
    const entity: MinRpsGameEntity = new MinRpsGameEntity();
    entity.createdAt = domain.createdAt;
    entity.id = domain.id;
    entity.name = domain.name;
    return entity;
  }
}
