import { MinAdventDoorStatus } from '../enums/minadvent-door-status.enum';
import { MinAdventBlock } from './minadvent-block';

export class MinAdventDoor {
  public blocks: MinAdventBlock[] = [];
  public day: number = 1;
  public status: MinAdventDoorStatus = MinAdventDoorStatus.Empty;
}
