import { UnauthorizedException } from '@nestjs/common';
import { OnGatewayConnection, OnGatewayDisconnect, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { FirebaseUserDto } from 'src/core/authentication/models/firebase-user.dto';
import { AuthenticationService } from 'src/core/authentication/services/authentication.service';
import { MinPokerTournamentService } from '../services/minpoker-tournament.service';
import { MinPokerCommand } from '../models/enums/minpoker-command.enum';
import { MinPokerEvent } from '../models/enums/minpoker-event.enum';
import { MinPokerConnectedEvent } from '../models/events/minpoker-connected.event';
import { MinPokerDisconnectedEvent } from '../models/events/minpoker-disconnected.event';
import { Namespace } from 'src/shared/enums/namespace.enum';

@WebSocketGateway({
  cors: { origin: '*' },
  namespace: Namespace.MinPoker,
})
export class MinPokerGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  public server: Server;

  constructor(
    private readonly tournamentService: MinPokerTournamentService,
    private readonly authenticationService: AuthenticationService,
  ) {}

  public async handleConnection(client: Socket): Promise<void> {
    console.warn(`Receiving Command: ${MinPokerCommand.Connect}`);

    try {
      const firebaseUser: FirebaseUserDto = await this.authenticateClient(client);
      client.data.firebaseUser = firebaseUser;

      const event: MinPokerConnectedEvent = await this.tournamentService.handleConnection(firebaseUser.firebaseUid);
      this.sendClientEvent(client, MinPokerEvent.MatchConnected, event);
    } catch {
      console.warn('Unauthorized MinPoker connection attempt', { socketId: client.id });
      client.disconnect(true);
    }
  }

  public async handleDisconnect(client: Socket): Promise<void> {
    console.warn(`Receiving Command: ${MinPokerCommand.Disconnect}`);

    const firebaseUser: FirebaseUserDto | undefined = client.data?.firebaseUser;
    if (!firebaseUser?.firebaseUid) {
      console.warn('No authenticated user on disconnected socket', { socketId: client.id });
      return;
    }

    const event: MinPokerDisconnectedEvent = await this.tournamentService.handleDisconnect(firebaseUser.firebaseUid);
    this.sendServerEvent(MinPokerEvent.MatchDisconnected, event);
  }

  private async authenticateClient(client: Socket): Promise<FirebaseUserDto> {
    const token: string = this.extractToken(client);
    const decodedToken = await this.authenticationService.verifyIdToken(token);

    if (!decodedToken.uid || !decodedToken.email) {
      throw new UnauthorizedException('Firebase token is missing required claims');
    }

    return {
      firebaseUid: decodedToken.uid,
      email: decodedToken.email,
    };
  }

  private extractToken(client: Socket): string {
    const tokenFromAuth: unknown = client.handshake.auth?.token;
    if (typeof tokenFromAuth === 'string' && tokenFromAuth.length > 0) {
      return tokenFromAuth;
    }

    const authorizationHeader = Array.isArray(client.handshake.headers.authorization)
      ? client.handshake.headers.authorization[0]
      : client.handshake.headers.authorization;

    if (!authorizationHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing or invalid Authorization header');
    }

    return authorizationHeader.slice('Bearer '.length);
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
