import { Injectable } from '@angular/core';
import { MinRpsGameEvent } from '../models/enums/minrps-game-event.enum';
import { MinRpsJoinPayload } from '../models/payloads/minrps-join.payload';
import { MinRpsLeavePayload } from '../models/payloads/minrps-leave.payload';
import { MinRpsSocketRepository } from '../repositories/minrps-socket.repository';

@Injectable({
  providedIn: 'root',
})
export class MinRpsMultiplayerService {
  constructor(private readonly socketRepository: MinRpsSocketRepository) {}

  public connect(): void {
    this.socketRepository.connect();
  }

  public disconnect(): void {
    this.socketRepository.disconnect();
  }

  public offEvent<T>(event: MinRpsGameEvent, callback: (payload: T) => void): void {
    this.socketRepository.off(event, callback);
  }

  public onEvent<T>(event: MinRpsGameEvent, callback: (payload: T) => void): void {
    this.socketRepository.on(event, callback);
  }

  public sendJoinEvent(payload: MinRpsJoinPayload): void {
    this.socketRepository.emit(MinRpsGameEvent.Join, payload);
  }

  public sendLeaveEvent(payload: MinRpsLeavePayload): void {
    this.socketRepository.emit(MinRpsGameEvent.Leave, payload);
  }
}
