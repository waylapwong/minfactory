import {
  ConnectedSocket,
  MessageBody,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { MinPokerConnectCommand } from '../models/commands/minpoker-connect.command';
import { MinPokerCommand } from '../models/enums/minpoker-command.enum';
import { MinPokerEvent } from '../models/enums/minpoker-event.enum';
import { MinPokerConnectedEvent } from '../models/events/minpoker-connected.event';
import { MinPokerDisconnectedEvent } from '../models/events/minpoker-disconnected.event';
import { MinPokerTournamentService } from '../services/minpoker-tournament.service';
import { Namespace } from 'src/shared/enums/namespace.enum';

@WebSocketGateway({
  cors: { origin: '*' },
  namespace: Namespace.MinPoker,
})
export class MinPokerGateway implements OnGatewayDisconnect {
  @WebSocketServer()
  public server: Server;

  constructor(private readonly tournamentService: MinPokerTournamentService) {}

  @SubscribeMessage(MinPokerCommand.Connect)
  public handleConnectCommand(@ConnectedSocket() client: Socket, @MessageBody() command: MinPokerConnectCommand): void {
    console.warn(`Receiving Command: ${MinPokerCommand.Connect}`);

    client.data.playerId = command.playerId;
    const event: MinPokerConnectedEvent = this.tournamentService.handleConnection(command.playerId);
    this.sendClientEvent(client, MinPokerEvent.MatchConnected, event);
  }

  public handleDisconnect(client: Socket): void {
    console.warn(`Receiving Command: ${MinPokerCommand.Disconnect}`);

    const playerId: string | undefined = client.data?.playerId;
    if (!playerId) {
      console.warn('No playerId on disconnected socket', { socketId: client.id });
      return;
    }

    const event: MinPokerDisconnectedEvent = this.tournamentService.handleDisconnect(playerId);
    this.sendServerEvent(MinPokerEvent.MatchDisconnected, event);
  }

  private sendClientEvent(client: Socket, event: MinPokerEvent, payload: any): void {
    client.emit(event, payload);
    console.warn(`Sending Event: ${event}`, payload);
  }

  private sendServerEvent(event: MinPokerEvent, payload: any): void {
    this.server.emit(event, payload);
    console.warn(`Sending Event: ${event}`, payload);
  }
}
