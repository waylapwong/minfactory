import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { MinPokerJoinCommand } from '../models/commands/minpoker-join.command';
import { MinPokerSeatCommand } from '../models/commands/minpoker-seat.command';
import { MinPokerCommand } from '../models/enums/minpoker-command.enum';
import { MinPokerEvent } from '../models/enums/minpoker-event.enum';
import { MinPokerConnectedEvent } from '../models/events/minpoker-connected.event';
import { MinPokerDisconnectedEvent } from '../models/events/minpoker-disconnected.event';
import { MinPokerUpdatedEvent } from '../models/events/minpoker-updated.event';
import { MinPokerTournamentService } from '../services/minpoker-tournament.service';
import { Namespace } from 'src/shared/enums/namespace.enum';

@WebSocketGateway({
  cors: { origin: '*' },
  namespace: Namespace.MinPoker,
})
export class MinPokerGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  public server: Server;

  constructor(private readonly tournamentService: MinPokerTournamentService) {}

  @SubscribeMessage(MinPokerCommand.Join)
  public async handleJoinCommand(
    @ConnectedSocket() client: Socket,
    @MessageBody() command: MinPokerJoinCommand,
  ): Promise<void> {
    console.warn(`Receiving Command: ${MinPokerCommand.Join}`, command);
    const event: MinPokerUpdatedEvent = await this.tournamentService.joinMatch(client, command);
    this.sendMatchUpdatedEvent(event);
  }

  @SubscribeMessage(MinPokerCommand.Seat)
  public async handleSeatCommand(@MessageBody() command: MinPokerSeatCommand): Promise<void> {
    console.warn(`Receiving Command: ${MinPokerCommand.Seat}`, command);
    const event: MinPokerUpdatedEvent = await this.tournamentService.seatPlayer(command);
    this.sendMatchUpdatedEvent(event);
  }

  public handleConnection(client: Socket): void {
    console.warn('Receiving Command: Connect');
    const event: MinPokerConnectedEvent = this.tournamentService.handleConnection(client);
    this.sendClientEvent(client, MinPokerEvent.MatchConnected, event);
  }

  public handleDisconnect(client: Socket): void {
    console.warn('Receiving Command: Disconnect');
    const result = this.tournamentService.handleDisconnect(client);
    if (!result) {
      console.warn('No playerId on disconnected socket', { socketId: client.id });
      return;
    }

    this.sendDisconnectedEvent(result.disconnectedEvent);
    if (result.updatedEvent) {
      this.sendMatchUpdatedEvent(result.updatedEvent);
    }
  }

  private sendClientEvent(client: Socket, event: MinPokerEvent, payload: any): void {
    client.emit(event, payload);
    console.warn(`Sending Event: ${event}`, payload);
  }

  private sendDisconnectedEvent(payload: MinPokerDisconnectedEvent): void {
    if (payload.matchId) {
      this.server.to(payload.matchId).emit(MinPokerEvent.MatchDisconnected, payload);
    } else {
      this.server.emit(MinPokerEvent.MatchDisconnected, payload);
    }
    console.warn(`Sending Event: ${MinPokerEvent.MatchDisconnected}`, payload);
  }

  private sendMatchUpdatedEvent(payload: MinPokerUpdatedEvent): void {
    this.server.to(payload.matchId).emit(MinPokerEvent.Updated, payload);
    console.warn(`Sending Event: ${MinPokerEvent.Updated}`, payload);
  }
}
