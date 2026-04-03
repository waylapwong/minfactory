import { ApplicationRef, Injectable } from '@angular/core';
import { Socket, SocketIoConfig } from 'ngx-socket-io';
import { ENVIRONMENT } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class MinPokerSocketRepository extends Socket {
  constructor(appRef: ApplicationRef) {
    super(MINPOKER_SOCKET_CONFIG, appRef);
  }
}

const MINPOKER_SOCKET_CONFIG: SocketIoConfig = {
  url: `${ENVIRONMENT.API_BASE_PATH}/minpoker`,
};
