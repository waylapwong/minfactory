import { MinRPSGame } from '../models/domain/minrps-game';
import { MinRPSGameRequestDTO } from '../models/dtos/minrps-game-request';
import { MinRPSGameResponseDTO } from '../models/dtos/minrps-game-response.dto';
import { MinRPSGameEntity } from '../models/entities/minrps-game.entity';

export class MinRPSGameMapper {
  public static fromDomainToDTO(domain: MinRPSGame): MinRPSGameResponseDTO {
    const dto: MinRPSGameResponseDTO = new MinRPSGameResponseDTO();
    dto.id = domain.id;
    dto.name = domain.name;
    return dto;
  }

  public static fromEntityToDTO(entity: MinRPSGameEntity): MinRPSGameResponseDTO {
    const domain: MinRPSGame = MinRPSGameMapper.fromEntityToDomain(entity);
    return MinRPSGameMapper.fromDomainToDTO(domain);
  }

  public static fromEntityToDomain(entity: MinRPSGameEntity): MinRPSGame {
    const domain: MinRPSGame = new MinRPSGame();
    domain.id = entity.id;
    domain.name = entity.name;
    return domain;
  }

  public static toDomainFromDTO(dto: MinRPSGameRequestDTO): MinRPSGame {
    const domain: MinRPSGame = new MinRPSGame();
    domain.name = dto.name;
    return domain;
  }

  public static toEntityFromDTO(dto: MinRPSGameRequestDTO): MinRPSGameEntity {
    const domain: MinRPSGame = MinRPSGameMapper.toDomainFromDTO(dto);
    return MinRPSGameMapper.toEntityFromDomain(domain);
  }

  public static toEntityFromDomain(domain: MinRPSGame): MinRPSGameEntity {
    const entity: MinRPSGameEntity = new MinRPSGameEntity();
    entity.id = domain.id;
    entity.name = domain.name;
    return entity;
  }
}
