import { Injectable } from '@angular/core';
import { MinRpsGameEvent } from '../models/enums/minrps-game-event.enum';
import { MinRpsJoinPayload } from '../models/payloads/minrps-join.payload';
import { MinRpsLeavePayload } from '../models/payloads/minrps-leave.payload';
import { MinRpsSelectMovePayload } from '../models/payloads/minrps-select-move.payload';
import { MinRpsPlayPayload } from '../models/payloads/minrps-play.payload';
import { MinRpsTakeSeatPayload } from '../models/payloads/minrps-take-seat.payload';
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

  public sendTakeSeatEvent(payload: MinRpsTakeSeatPayload): void {
    this.socketRepository.emit(MinRpsGameEvent.TakeSeat, payload);
  }

  public sendSelectMoveEvent(payload: MinRpsSelectMovePayload): void {
    this.socketRepository.emit(MinRpsGameEvent.SelectMove, payload);
  }

  public sendPlayEvent(payload: MinRpsPlayPayload): void {
    this.socketRepository.emit(MinRpsGameEvent.Play, payload);
  }
}
