import { MinAdventDoorStatus } from '../entities/minadvent-door.entity';

export class MinAdventDoor {
  public day: number = 1;
  public status: MinAdventDoorStatus = MinAdventDoorStatus.Empty;
}
