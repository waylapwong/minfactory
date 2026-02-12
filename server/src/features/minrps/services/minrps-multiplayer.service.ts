import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';
import { MinRpsJoinPayload } from '../models/payloads/minrps-join.payload';
import { MinRpsJoinedPayload } from '../models/payloads/minrps-joined.payload';
import { MinRpsLeavePayload } from '../models/payloads/minrps-leave.payload';
import { MinRpsLeftPayload } from '../models/payloads/minrps-left.payload';
import { MinRpsRoomSystem } from '../systems/minrps-room.system';

@Injectable()
export class MinRpsMultiplayerService {
  constructor(private readonly roomSystem: MinRpsRoomSystem) {}

  public getAllPlayerRoomNames(client: Socket): string[] {
    return this.roomSystem.getAllPlayerRoomNames(client);
  }

  public joinGame(client: Socket, joinPayload: MinRpsJoinPayload): MinRpsJoinedPayload {
    // Player joins room
    this.roomSystem.addPlayerToRoom(client, joinPayload.gameId);
    // Build payload
    const joinedPayload: MinRpsJoinedPayload = new MinRpsJoinedPayload();
    joinedPayload.gameId = joinPayload.gameId;
    joinedPayload.playerId = joinPayload.playerId;

    return joinedPayload;
  }

  public leaveGame(client: Socket, leavePayload: MinRpsLeavePayload): MinRpsLeftPayload {
    // Player leaves room
    this.roomSystem.removePlayerFromRoom(client, leavePayload.gameId);
    // Build payload
    const leftPayload: MinRpsLeftPayload = new MinRpsLeftPayload();
    leftPayload.gameId = leavePayload.gameId;
    leftPayload.playerId = leavePayload.playerId;

    return leftPayload;
  }

  public removePlayerFromAllRooms(client: Socket): void {
    this.roomSystem.removePlayerFromAllRooms(client);
  }
}
