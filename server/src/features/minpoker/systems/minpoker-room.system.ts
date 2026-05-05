import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';

@Injectable()
export class MinPokerRoomSystem {
  private readonly rooms: Map<string, Set<string>> = new Map<string, Set<string>>();

  public addPlayerToRoom(clientSocket: Socket, roomName: string): void {
    clientSocket.join(roomName);
    if (!this.rooms.has(roomName)) {
      this.rooms.set(roomName, new Set<string>());
    }
    this.rooms.get(roomName)?.add(clientSocket.id);
  }

  public getPlayerRoomName(client: Socket): string | null {
    for (const [roomName, clientIds] of this.rooms.entries()) {
      if (clientIds.has(client.id)) {
        return roomName;
      }
    }
    return null;
  }

  public removePlayerFromAllRooms(clientSocket: Socket): void {
    for (const [roomName, clientIds] of this.rooms.entries()) {
      if (!clientIds.has(clientSocket.id)) {
        continue;
      }
      this.removePlayerFromRoom(clientSocket, roomName);
    }
  }

  public removePlayerFromRoom(clientSocket: Socket, roomName: string): void {
    clientSocket.leave(roomName);
    const room: Set<string> | undefined = this.rooms.get(roomName);
    if (!room) {
      return;
    }
    room.delete(clientSocket.id);
    if (room.size === 0) {
      this.rooms.delete(roomName);
    }
  }
}
