import { Injectable } from '@nestjs/common';
import { MinRpsGameMapper } from '../mapper/minrps-game.mapper';
import { MinRpsMatchMapper } from '../mapper/minrps-match.mapper';
import { MinRpsGame } from '../models/domains/minrps-game';
import { MinRpsPlayer } from '../models/domains/minrps-player';
import { MinRpsMatchRequestDto } from '../models/dtos/minrps-match-request.dto';
import { MinRpsMatchResponseDto } from '../models/dtos/minrps-match-response.dto';
import { MinRpsGameEntity } from '../models/entities/minrps-game.entity';
import { MinRpsMove } from '../models/enums/minrps-move.enum';
import { MinRpsGameRepository } from '../repositories/minrps-game.repository';
import { MinRpsMatchRepository } from '../repositories/minrps-match.repository';

@Injectable()
export class MinRpsMatchService {
  constructor(
    private readonly gameRepository: MinRpsGameRepository,
    private readonly matchRepository: MinRpsMatchRepository,
  ) {}

  public async addObserver(playerId: string, matchId: string): Promise<void> {
    const match: MinRpsGame | undefined = this.matchRepository.findById(matchId);
    if (match) {
      match.addObserver();
    } else {
      const gameEntity: MinRpsGameEntity = await this.gameRepository.find(matchId);
      const game: MinRpsGame = MinRpsGameMapper.entityToDomain(gameEntity);
      game.addObserver();
      this.matchRepository.save(matchId, game);
    }
  }

  public computeMatchResult(requestDto: MinRpsMatchRequestDto): MinRpsMatchResponseDto {
    const domain: MinRpsGame = MinRpsMatchMapper.dtoToDomain(requestDto);

    domain.setPlayer2(new MinRpsPlayer());
    domain.setPlayer2Move(this.getRandomMove());

    const responseDto: MinRpsMatchResponseDto = MinRpsMatchMapper.domainToDto(domain);
    responseDto.result = domain.getResult();

    return responseDto;
  }

  private getRandomMove(): MinRpsMove {
    const moves: MinRpsMove[] = [MinRpsMove.Rock, MinRpsMove.Paper, MinRpsMove.Scissors];
    const randomIndex: number = Math.floor(Math.random() * moves.length);
    return moves[randomIndex];
  }
}
