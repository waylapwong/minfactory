import { OnGatewayConnection, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { Namespace } from 'src/shared/enums/namespace.enum';

@WebSocketGateway({
  cors: { origin: '*' },
  namespace: Namespace.MinPoker,
})
export class MinPokerGateway implements OnGatewayConnection {
  @WebSocketServer()
  public server: Server;

  constructor() {}

  public handleConnection(client: any, ...args: any[]): void {
    // Handle new client connection
  }
}
