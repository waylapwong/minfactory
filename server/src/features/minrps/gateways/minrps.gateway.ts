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
import { Namespace } from '../../../shared/enums/namespace.enum';
import { MinRpsMatchCommand } from '../models/enums/minrps-match-command.enum';
import { MinRpsMatchEvent } from '../models/enums/minrps-match-event.enum';
import { MinRpsMove } from '../models/enums/minrps-move.enum';
import { MinRpsMatchConnectedPayload } from '../models/payloads/minrps-match-connected.payload';
import type { MinRpsMatchJoinPayload } from '../models/payloads/minrps-match-join.payload';
import type { MinRpsMatchLeavePayload } from '../models/payloads/minrps-match-leave.payload';
import { MinRpsMatchPlayPayload } from '../models/payloads/minrps-match-play.payload';
import { MinRpsMatchSeatPayload } from '../models/payloads/minrps-match-seat.payload';
import { MinRpsMatchUpdatedPayload } from '../models/payloads/minrps-match-updated.payload';
import { MinRpsMultiplayerService } from '../services/minrps-multiplayer.service';

@WebSocketGateway({
  cors: { origin: '*' },
  namespace: Namespace.MinRps,
})
export class MinRpsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  public server: Server;

  constructor(private readonly multiplayerService: MinRpsMultiplayerService) {}

  @SubscribeMessage(MinRpsMatchCommand.Join)
  public handleJoinCommand(
    @ConnectedSocket() client: Socket,
    @MessageBody() command: MinRpsMatchJoinPayload,
  ): void {
    const event: MinRpsMatchUpdatedPayload = this.multiplayerService.joinMatch(client, command);
    this.sendMatchUpdatedEvent(event);
  }

  @SubscribeMessage(MinRpsMatchCommand.Leave)
  public handleLeaveCommand(
    @ConnectedSocket() client: Socket,
    @MessageBody() command: MinRpsMatchLeavePayload,
  ): void {
    const event: MinRpsMatchUpdatedPayload = this.multiplayerService.leaveMatch(client, command);
    this.sendMatchUpdatedEvent(event);
  }

  @SubscribeMessage(MinRpsMatchCommand.Play)
  public handlePlayCommand(
    @ConnectedSocket() client: Socket,
    @MessageBody() command: MinRpsMatchPlayPayload,
  ): void {
    const event: MinRpsMatchUpdatedPayload = this.multiplayerService.playMatch(command);
    if (event.player1Move !== MinRpsMove.None && event.player2Move !== MinRpsMove.None) {
      this.sendMatchUpdatedEvent(event);
      setTimeout(() => {
        const resetEvent: MinRpsMatchUpdatedPayload = this.multiplayerService.resetMatch(
          command.matchId,
        );
        this.sendMatchUpdatedEvent(resetEvent);
      }, 3000);
    } else {
      this.sendClientEvent(client, MinRpsMatchEvent.Updated, event);
    }
  }

  @SubscribeMessage(MinRpsMatchCommand.Seat)
  public handleSeatCommand(@MessageBody() command: MinRpsMatchSeatPayload): void {
    const event: MinRpsMatchUpdatedPayload = this.multiplayerService.seatPlayer(command);
    this.sendMatchUpdatedEvent(event);
  }

  public handleConnection(client: Socket): void {
    const event: MinRpsMatchConnectedPayload = this.multiplayerService.handleConnection(client);
    this.sendClientEvent(client, MinRpsMatchEvent.Connected, event);
  }

  public handleDisconnect(client: Socket): void {
    const event: MinRpsMatchUpdatedPayload | null =
      this.multiplayerService.handleDisconnect(client);
    if (event) {
      this.sendMatchUpdatedEvent(event);
    }
  }

  private sendClientEvent(client: Socket, event: MinRpsMatchEvent, payload: any): void {
    client.emit(event, payload);
  }

  private sendMatchUpdatedEvent(payload: MinRpsMatchUpdatedPayload): void {
    this.sendRoomEvent(payload.matchId, MinRpsMatchEvent.Updated, payload);
  }

  private sendRoomEvent(room: string, event: MinRpsMatchEvent, payload: any): void {
    this.server.to(room).emit(event, payload);
  }
}
