import { Injectable } from '@nestjs/common';
import { MinPokerConnectedEvent } from '../models/events/minpoker-connected.event';
import { MinPokerDisconnectedEvent } from '../models/events/minpoker-disconnected.event';
import { MinFactoryUserEntity } from 'src/features/minfactory/models/entities/minfactory-user.entity';
import { MinFactoryUserRepository } from 'src/features/minfactory/repositories/minfactory-user.repository';

@Injectable()
export class MinPokerTournamentService {
  constructor(private readonly userRepository: MinFactoryUserRepository) {}

  public async handleConnection(firebaseUid: string): Promise<MinPokerConnectedEvent> {
    const userEntity: MinFactoryUserEntity = await this.userRepository.findByFirebaseUid(firebaseUid);
    const event: MinPokerConnectedEvent = new MinPokerConnectedEvent();
    event.playerId = userEntity.id;
    return event;
  }

  public async handleDisconnect(firebaseUid: string): Promise<MinPokerDisconnectedEvent> {
    const userEntity: MinFactoryUserEntity = await this.userRepository.findByFirebaseUid(firebaseUid);
    const event: MinPokerDisconnectedEvent = new MinPokerDisconnectedEvent();
    event.playerId = userEntity.id;
    return event;
  }
}
