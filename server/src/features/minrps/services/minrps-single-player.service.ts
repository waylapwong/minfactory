import { Injectable } from '@nestjs/common';
import { MinRpsDomainMapper } from '../mapper/minrps-domain.mapper';
import { MinRpsDtoMapper } from '../mapper/minrps-dto.mapper';
import { MinRpsGame } from '../models/domains/minrps-game';
import { MinRpsPlayer } from '../models/domains/minrps-player';
import { MinRpsPlayResultDto } from '../models/dtos/minrps-play-result.dto';
import { MinRpsPlayDto } from '../models/dtos/minrps-play.dto';
import { MinRpsMove } from '../models/enums/minrps-move.enum';

@Injectable()
export class MinRpsSinglePlayerService {
  public play(playDto: MinRpsPlayDto): MinRpsPlayResultDto {
    const domain: MinRpsGame = MinRpsDtoMapper.playDtoToDomain(playDto);

    domain.setPlayer2(new MinRpsPlayer());
    domain.setPlayer2Move(this.getRandomMove());

    const responseDto: MinRpsPlayResultDto = MinRpsDomainMapper.domainToPlayResultDto(domain);
    responseDto.result = domain.getResult();

    return responseDto;
  }

  private getRandomMove(): MinRpsMove {
    const moves: MinRpsMove[] = [MinRpsMove.Rock, MinRpsMove.Paper, MinRpsMove.Scissors];
    const randomIndex: number = Math.floor(Math.random() * moves.length);
    return moves[randomIndex];
  }
}
