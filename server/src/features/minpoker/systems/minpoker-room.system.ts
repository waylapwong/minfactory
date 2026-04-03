import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';

@Injectable()
export class MinPokerRoomSystem {
  private readonly rooms: Map<string, Set<string>> = new Map<string, Set<string>>();

  public addPlayerToRoom(client: Socket, roomName: string): void {
    client.join(roomName);
    if (!this.rooms.has(roomName)) {
      this.rooms.set(roomName, new Set<string>());
    }
    this.rooms.get(roomName)?.add(client.id);
  }

  public getPlayerRoomName(client: Socket): string | null {
    for (const [roomName, clientIds] of this.rooms.entries()) {
      if (clientIds.has(client.id)) {
        return roomName;
      }
    }

    return null;
  }

  public removePlayerFromRoom(client: Socket, roomName: string): void {
    client.leave(roomName);
    const room: Set<string> | undefined = this.rooms.get(roomName);
    if (!room) {
      return;
    }

    room.delete(client.id);
    if (room.size === 0) {
      this.rooms.delete(roomName);
    }
  }

  public removePlayerFromAllRooms(client: Socket): void {
    for (const [roomName, clientIds] of this.rooms.entries()) {
      if (!clientIds.has(client.id)) {
        continue;
      }

      this.removePlayerFromRoom(client, roomName);
    }
  }
}
