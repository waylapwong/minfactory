import { MinAdventDoorStatus } from '../enums/minadvent-door-status.enum';

export class MinAdventDoor {
  public day: number = 1;
  public status: MinAdventDoorStatus = MinAdventDoorStatus.Empty;
}
