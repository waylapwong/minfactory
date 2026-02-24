import { Injectable } from '@nestjs/common';
import { MinRpsDomainMapper } from '../mapper/minrps-domain.mapper';
import { MinRpsDtoMapper } from '../mapper/minrps-dto.mapper';
import { MinRpsGame } from '../models/domains/minrps-game';
import { MinRpsPlayer } from '../models/domains/minrps-player';
import { MinRpsPlayResultDto } from '../models/dtos/minrps-play-result.dto';
import { MinRpsPlayDto } from '../models/dtos/minrps-play.dto';
import { MinRpsResult } from '../models/enums/minrps-game-result.enum';
import { MinRpsMove } from '../models/enums/minrps-move.enum';

@Injectable()
export class MinRpsSingleplayerService {
  public playGame(playDto: MinRpsPlayDto): MinRpsPlayResultDto {
    // Mapping
    const domain: MinRpsGame = MinRpsDtoMapper.playDtoToDomain(playDto);
    // NPC move
    domain.addPlayer2(new MinRpsPlayer());
    domain.setPlayer2Move(this.getRandomMove());
    // Game result
    const result: MinRpsResult = domain.getResult();
    // Mapping
    const responseDto: MinRpsPlayResultDto = MinRpsDomainMapper.domainToPlayResultDto(domain);
    responseDto.result = result;

    return responseDto;
  }

  private getRandomMove(): MinRpsMove {
    const moves: MinRpsMove[] = [MinRpsMove.Rock, MinRpsMove.Paper, MinRpsMove.Scissors];
    const randomIndex: number = Math.floor(Math.random() * moves.length);
    return moves[randomIndex];
  }
}
