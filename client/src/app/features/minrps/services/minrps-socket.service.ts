import { ApplicationRef, Injectable } from '@angular/core';
import { Socket, SocketIoConfig } from 'ngx-socket-io';

@Injectable({
  providedIn: 'root',
})
export class MinRpsSocketService extends Socket {
  constructor(appRef: ApplicationRef) {
    super(MINRPS_SOCKET_CONFIG, appRef);
  }

  public emitJoin(gameId: string, playerId: string, move: 'rock' | 'paper' | 'scissors') {
  }
}

const MINRPS_SOCKET_CONFIG: SocketIoConfig = {
  url: 'http://localhost:3000/minrps',
};
