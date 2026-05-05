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
import { AuthenticationService } from '../../../core/authentication/services/authentication.service';
import { Namespace } from '../../../shared/enums/namespace.enum';
import { MinPokerJoinCommand } from '../models/commands/minpoker-join.command';
import { MinPokerLeaveCommand } from '../models/commands/minpoker-leave.command';
import { MinPokerSeatCommand } from '../models/commands/minpoker-seat.command';
import { MinPokerCommand } from '../models/enums/minpoker-command.enum';
import { MinPokerEvent } from '../models/enums/minpoker-event.enum';
import { MinPokerConnectedEvent } from '../models/events/minpoker-connected.event';
import { MinPokerDisconnectedEvent } from '../models/events/minpoker-disconnected.event';
import { MinPokerHandDealtEvent } from '../models/events/minpoker-hand-dealt.event';
import { MinPokerUpdatedEvent } from '../models/events/minpoker-updated.event';
import { MinPokerPlayerIdRepository } from '../repositories/minpoker-player-id.repository';
import { MinPokerSeatResult, MinPokerTournamentService } from '../services/minpoker-tournament.service';
import { DecodedIdToken } from 'firebase-admin/auth';

@WebSocketGateway({
  cors: { origin: '*' },
  namespace: Namespace.MinPoker,
})
export class MinPokerGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  public server!: Server;

  constructor(
    private readonly authenticationService: AuthenticationService,
    private readonly playerIdRepository: MinPokerPlayerIdRepository,
    private readonly tournamentService: MinPokerTournamentService,
  ) {}

  @SubscribeMessage(MinPokerCommand.Join)
  public async handleJoinCommand(@ConnectedSocket() clientSocket: Socket, @MessageBody() command: MinPokerJoinCommand): Promise<void> {
    console.log(`Incoming Command: ${MinPokerCommand.Join}`, command);
    const event: MinPokerUpdatedEvent = await this.tournamentService.handleJoinCommand(clientSocket, command);
    this.sendMatchUpdatedEvent(event);
  }

  @SubscribeMessage(MinPokerCommand.Leave)
  public handleLeaveCommand(@ConnectedSocket() clientSocket: Socket, @MessageBody() command: MinPokerLeaveCommand): void {
    console.log(`Incoming Command: ${MinPokerCommand.Leave}`, command);
    const event: MinPokerUpdatedEvent | null = this.tournamentService.handleLeaveCommand(clientSocket, command);
    if (event) {
      this.sendMatchUpdatedEvent(event);
    }
  }

  @SubscribeMessage(MinPokerCommand.Seat)
  public async handleSeatCommand(@ConnectedSocket() clientSocket: Socket, @MessageBody() command: MinPokerSeatCommand): Promise<void> {
    console.log(`Incoming Command: ${MinPokerCommand.Seat}`, command);
    const result: MinPokerSeatResult = await this.tournamentService.handleSeatCommand(clientSocket, command);
    this.sendMatchUpdatedEvent(result.updatedEvent);

    if (result.hands) {
      for (const [playerId, hand] of result.hands) {
        this.sendHandDealtEvent(playerId, hand);
      }
    }
  }

  public async handleConnection(clientSocket: Socket): Promise<void> {
    console.log('Incoming Command: Connect');
    try {
      const firebaseIdToken: string | undefined = clientSocket.handshake.auth?.token;
      if (!firebaseIdToken) {
        clientSocket.disconnect();
        return;
      }
      const decodedFirebaseIdToken: DecodedIdToken = await this.authenticationService.verifyFirebaseIdToken(firebaseIdToken);
      const event: MinPokerConnectedEvent = await this.tournamentService.handleConnectionCommand(clientSocket, decodedFirebaseIdToken.uid);
      this.sendClientEvent(clientSocket, MinPokerEvent.MatchConnected, event);
    } catch (error: unknown) {
      console.error('MinPoker connection authentication failed', error);
      clientSocket.disconnect();
      return;
    }
  }

  public handleDisconnect(clientSocket: Socket): void {
    console.log('Incoming Command: Disconnect');
    const event: MinPokerDisconnectedEvent | null = this.tournamentService.handleDisconnectCommand(clientSocket);
    if (!event) {
      console.log('No playerId on disconnected socket', { socketId: clientSocket.id });
      return;
    }
    this.sendDisconnectedEvent(event);
  }

  private sendClientEvent(clientSocket: Socket, eventName: MinPokerEvent, event: any): void {
    clientSocket.emit(eventName, event);
    console.log(`Outgoing Event: ${eventName}`, event);
  }

  private sendDisconnectedEvent(event: MinPokerDisconnectedEvent): void {
    if (event.matchId) {
      this.server.to(event.matchId).emit(MinPokerEvent.MatchDisconnected, event);
    } else {
      this.server.emit(MinPokerEvent.MatchDisconnected, event);
    }
    console.log(`Outgoing Event: ${MinPokerEvent.MatchDisconnected}`, event);
  }

  private sendHandDealtEvent(playerId: string, event: MinPokerHandDealtEvent): void {
    const socketId: string | null = this.playerIdRepository.findByPlayerId(playerId);
    if (socketId) {
      this.server.to(socketId).emit(MinPokerEvent.HandDealt, event);
      console.log(`Outgoing Event: ${MinPokerEvent.HandDealt} to ${playerId}`, event);
    }
  }

  private sendMatchUpdatedEvent(event: MinPokerUpdatedEvent): void {
    this.server.to(event.matchId).emit(MinPokerEvent.Updated, event);
    console.log(`Outgoing Event: ${MinPokerEvent.Updated}`, event);
  }
}
