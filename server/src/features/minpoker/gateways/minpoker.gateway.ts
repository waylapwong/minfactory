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
import { MinFactoryUserRepository } from '../../minfactory/repositories/minfactory-user.repository';
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
    private readonly userRepository: MinFactoryUserRepository,
  ) {}

  @SubscribeMessage(MinPokerCommand.Join)
  public async handleJoinCommand(@ConnectedSocket() client: Socket, @MessageBody() command: MinPokerJoinCommand): Promise<void> {
    console.log(`Receiving Command: ${MinPokerCommand.Join}`, command);
    const event: MinPokerUpdatedEvent = await this.tournamentService.joinMatch(client, command);
    this.sendMatchUpdatedEvent(event);
  }

  @SubscribeMessage(MinPokerCommand.Leave)
  public async handleLeaveCommand(@ConnectedSocket() client: Socket, @MessageBody() command: MinPokerLeaveCommand): Promise<void> {
    console.log(`Receiving Command: ${MinPokerCommand.Leave}`, command);
    const event: MinPokerUpdatedEvent | null = await this.tournamentService.leaveMatch(client, command);
    if (event) {
      this.sendMatchUpdatedEvent(event);
    }
  }

  @SubscribeMessage(MinPokerCommand.Seat)
  public async handleSeatCommand(@ConnectedSocket() client: Socket, @MessageBody() command: MinPokerSeatCommand): Promise<void> {
    console.log(`Receiving Command: ${MinPokerCommand.Seat}`, command);
    const result: MinPokerSeatResult = await this.tournamentService.seatPlayer(client, command);
    this.sendMatchUpdatedEvent(result.updatedEvent);

    if (result.hands) {
      for (const [playerId, handEvent] of result.hands) {
        this.sendHandDealtEvent(playerId, handEvent);
      }
    }
  }

  public async handleConnection(clientSocket: Socket): Promise<void> {
    console.log('Receiving Command: Connect');
    try {
      const firebaseIdToken: string | undefined = clientSocket.handshake.auth?.token;
      if (!firebaseIdToken) {
        clientSocket.disconnect();
        return;
      }
      const decodedFirebaseIdToken: DecodedIdToken = await this.authenticationService.verifyFirebaseIdToken(firebaseIdToken);
      const event: MinPokerConnectedEvent = await this.tournamentService.handleConnection(clientSocket, decodedFirebaseIdToken.uid);
      this.sendClientEvent(clientSocket, MinPokerEvent.MatchConnected, event);
    } catch (error: unknown) {
      console.error('MinPoker connection authentication failed', error);
      clientSocket.disconnect();
      return;
    }
  }

  public async handleDisconnect(clientSocket: Socket): Promise<void> {
    console.log('Receiving Command: Disconnect');
    const event: MinPokerDisconnectedEvent | null = await this.tournamentService.handleDisconnect(clientSocket);
    if (!event) {
      console.log('No playerId on disconnected socket', { socketId: clientSocket.id });
      return;
    }
    this.sendDisconnectedEvent(event);
  }

  private sendClientEvent(clientSocket: Socket, eventName: MinPokerEvent, event: any): void {
    clientSocket.emit(eventName, event);
    console.log(`Sending Event: ${eventName}`, event);
  }

  private sendDisconnectedEvent(event: MinPokerDisconnectedEvent): void {
    if (event.matchId) {
      this.server.to(event.matchId).emit(MinPokerEvent.MatchDisconnected, event);
    } else {
      this.server.emit(MinPokerEvent.MatchDisconnected, event);
    }
    console.log(`Sending Event: ${MinPokerEvent.MatchDisconnected}`, event);
  }

  private sendHandDealtEvent(playerId: string, event: MinPokerHandDealtEvent): void {
    const socketId: string | null = this.playerIdRepository.findByPlayerId(playerId);
    if (socketId) {
      this.server.to(socketId).emit(MinPokerEvent.HandDealt, event);
      console.log(`Sending Event: ${MinPokerEvent.HandDealt} to ${playerId}`, event);
    }
  }

  private sendMatchUpdatedEvent(event: MinPokerUpdatedEvent): void {
    this.server.to(event.matchId).emit(MinPokerEvent.Updated, event);
    console.log(`Sending Event: ${MinPokerEvent.Updated}`, event);
  }
}
