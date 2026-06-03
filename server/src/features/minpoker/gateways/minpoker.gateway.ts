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
import { LoggerService } from '../../../core/logging/services/logger.service';
import { Namespace } from '../../../shared/enums/namespace.enum';
import { MinPokerJoinCommand } from '../models/commands/minpoker-join.command';
import { MinPokerLeaveCommand } from '../models/commands/minpoker-leave.command';
import { MinPokerPauseCommand } from '../models/commands/minpoker-pause.command';
import { MinPokerResumeCommand } from '../models/commands/minpoker-resume.command';
import { MinPokerSeatCommand } from '../models/commands/minpoker-seat.command';
import { MinPokerStartCommand } from '../models/commands/minpoker-start.command';
import { MinPokerCommand } from '../models/enums/minpoker-command.enum';
import { MinPokerEvent } from '../models/enums/minpoker-event.enum';
import { MinPokerConnectedEvent } from '../models/events/minpoker-connected.event';
import { MinPokerDisconnectedEvent } from '../models/events/minpoker-disconnected.event';
import { MinPokerHandDealtEvent } from '../models/events/minpoker-hand-dealt.event';
import { MinPokerUpdatedEvent } from '../models/events/minpoker-updated.event';
import { MinPokerPlayerIdRepository } from '../repositories/minpoker-player-id.repository';
import {
  MinPokerDisconnectResult,
  MinPokerSeatResult,
  MinPokerStartResult,
  MinPokerTournamentService,
} from '../services/minpoker-tournament.service';
import { DecodedIdToken } from 'firebase-admin/auth';

@WebSocketGateway({
  cors: { origin: '*' },
  namespace: Namespace.MinPoker,
})
export class MinPokerGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger: LoggerService = new LoggerService(MinPokerGateway.name);

  @WebSocketServer()
  public server!: Server;

  constructor(
    private readonly authenticationService: AuthenticationService,
    private readonly playerIdRepository: MinPokerPlayerIdRepository,
    private readonly tournamentService: MinPokerTournamentService,
  ) {}

  @SubscribeMessage(MinPokerCommand.Join)
  public async handleJoinCommand(@ConnectedSocket() clientSocket: Socket, @MessageBody() command: MinPokerJoinCommand): Promise<void> {
    this.logger.debug(`Incoming Command: ${MinPokerCommand.Join} ${JSON.stringify(command)}`);
    const event: MinPokerUpdatedEvent = await this.tournamentService.handleJoinCommand(clientSocket, command);
    this.sendMatchUpdatedEvent(event);
  }

  @SubscribeMessage(MinPokerCommand.Leave)
  public handleLeaveCommand(@ConnectedSocket() clientSocket: Socket, @MessageBody() command: MinPokerLeaveCommand): void {
    this.logger.debug(`Incoming Command: ${MinPokerCommand.Leave} ${JSON.stringify(command)}`);
    const event: MinPokerUpdatedEvent | null = this.tournamentService.handleLeaveCommand(clientSocket, command);
    if (event) {
      this.sendMatchUpdatedEvent(event);
    }
  }

  @SubscribeMessage(MinPokerCommand.Pause)
  public handlePauseCommand(@ConnectedSocket() clientSocket: Socket, @MessageBody() command: MinPokerPauseCommand): void {
    this.logger.debug(`Incoming Command: ${MinPokerCommand.Pause} ${JSON.stringify(command)}`);
    const event: MinPokerUpdatedEvent = this.tournamentService.handlePauseCommand(clientSocket, command);
    this.sendMatchUpdatedEvent(event);
  }

  @SubscribeMessage(MinPokerCommand.Resume)
  public handleResumeCommand(@ConnectedSocket() clientSocket: Socket, @MessageBody() command: MinPokerResumeCommand): void {
    this.logger.debug(`Incoming Command: ${MinPokerCommand.Resume} ${JSON.stringify(command)}`);
    const event: MinPokerUpdatedEvent = this.tournamentService.handleResumeCommand(clientSocket, command);
    this.sendMatchUpdatedEvent(event);
  }

  @SubscribeMessage(MinPokerCommand.Seat)
  public async handleSeatCommand(@ConnectedSocket() clientSocket: Socket, @MessageBody() command: MinPokerSeatCommand): Promise<void> {
    this.logger.debug(`Incoming Command: ${MinPokerCommand.Seat} ${JSON.stringify(command)}`);
    const result: MinPokerSeatResult = await this.tournamentService.handleSeatCommand(clientSocket, command);
    this.sendMatchUpdatedEvent(result.updatedEvent);

    if (result.hands) {
      for (const [playerId, hand] of result.hands) {
        this.sendHandDealtEvent(playerId, hand);
      }
    }
  }

  @SubscribeMessage(MinPokerCommand.Start)
  public handleStartCommand(@ConnectedSocket() clientSocket: Socket, @MessageBody() command: MinPokerStartCommand): void {
    this.logger.debug(`Incoming Command: ${MinPokerCommand.Start} ${JSON.stringify(command)}`);
    const result: MinPokerStartResult = this.tournamentService.handleStartCommand(clientSocket, command);
    this.sendMatchUpdatedEvent(result.updatedEvent);

    if (result.hands) {
      for (const [playerId, hand] of result.hands) {
        this.sendHandDealtEvent(playerId, hand);
      }
    }
  }

  public async handleConnection(clientSocket: Socket): Promise<void> {
    this.logger.debug('Incoming Command: Connect');
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
      this.logger.error(`MinPoker connection authentication failed: ${error instanceof Error ? error.message : String(error)}`);
      clientSocket.disconnect();
      return;
    }
  }

  public handleDisconnect(clientSocket: Socket): void {
    this.logger.debug('Incoming Command: Disconnect');
    const result: MinPokerDisconnectResult | null = this.tournamentService.handleDisconnectCommand(clientSocket);
    if (!result) {
      this.logger.debug(`No playerId on disconnected socket: ${clientSocket.id}`);
      return;
    }
    this.sendDisconnectedEvent(result.disconnectedEvent);
    if (result.updatedEvent) {
      this.sendMatchUpdatedEvent(result.updatedEvent);
    }
  }

  private sendClientEvent(clientSocket: Socket, eventName: MinPokerEvent, event: any): void {
    clientSocket.emit(eventName, event);
    this.logger.debug(`Outgoing Event: ${eventName} ${JSON.stringify(event)}`);
  }

  private sendDisconnectedEvent(event: MinPokerDisconnectedEvent): void {
    if (event.matchId) {
      this.server.to(event.matchId).emit(MinPokerEvent.MatchDisconnected, event);
    } else {
      this.server.emit(MinPokerEvent.MatchDisconnected, event);
    }
    this.logger.debug(`Outgoing Event: ${MinPokerEvent.MatchDisconnected} ${JSON.stringify(event)}`);
  }

  private sendHandDealtEvent(playerId: string, event: MinPokerHandDealtEvent): void {
    const socketId: string | null = this.playerIdRepository.findByPlayerId(playerId);
    if (socketId) {
      this.server.to(socketId).emit(MinPokerEvent.HandDealt, event);
      this.logger.debug(`Outgoing Event: ${MinPokerEvent.HandDealt} to ${playerId} ${JSON.stringify(event)}`);
    }
  }

  private sendMatchUpdatedEvent(event: MinPokerUpdatedEvent): void {
    this.server.to(event.matchId).emit(MinPokerEvent.Updated, event);
    this.logger.debug(`Outgoing Event: ${MinPokerEvent.Updated} ${JSON.stringify(event)}`);
  }
}
