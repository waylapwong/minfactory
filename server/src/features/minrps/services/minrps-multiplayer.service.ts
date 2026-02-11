import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';
import { MinRpsJoinPayload } from '../models/payloads/minrps-join.payload';
import { MinRpsJoinedPayload } from '../models/payloads/minrps-joined.payload';
import { MinRpsLeavePayload } from '../models/payloads/minrps-leave.payload';
import { MinRpsLeftPayload } from '../models/payloads/minrps-left.payload';

@Injectable()
export class MinRpsMultiplayerService {
  public joinGame(client: Socket, joinPayload: MinRpsJoinPayload): MinRpsJoinedPayload {
    // Player joins room
    const room: string = joinPayload.gameId;
    client.join(room);
    // Build payload
    const joinedPayload: MinRpsJoinedPayload = new MinRpsJoinedPayload();
    joinedPayload.gameId = joinPayload.gameId;
    joinedPayload.playerId = joinPayload.playerId;

    return joinedPayload;
  }

  public leaveGame(client: Socket, leavePayload: MinRpsLeavePayload): MinRpsLeftPayload {
    // Player leaves room
    const room: string = leavePayload.gameId;
    client.leave(room);
    // Build payload
    const leftPayload: MinRpsLeftPayload = new MinRpsLeftPayload();
    leftPayload.gameId = leavePayload.gameId;
    leftPayload.playerId = leavePayload.playerId;

    return leftPayload;
  }
}
