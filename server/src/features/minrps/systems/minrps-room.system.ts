import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';

@Injectable()
export class MinRpsRoomSystem {
  private readonly rooms = new Map<string, Set<string>>();

  public addPlayerToRoom(client: Socket, roomName: string): void {
    client.join(roomName);
    if (!this.rooms.has(roomName)) {
      this.createRoom(roomName);
    }
    this.rooms.get(roomName)!.add(client.id);
  }

  public getAllPlayerRoomNames(client: Socket): string[] {
    const roomNames: string[] = [];
    for (const roomName of this.rooms.keys()) {
      if (this.rooms.get(roomName)!.has(client.id)) {
        roomNames.push(roomName);
      }
    }
    return roomNames;
  }

  public removePlayerFromAllRooms(client: Socket): void {
    for (const room of this.rooms.keys()) {
      this.removePlayerFromRoom(client, room);
    }
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

  private createRoom(roomName: string): void {
    this.rooms.set(roomName, new Set());
  }
}
