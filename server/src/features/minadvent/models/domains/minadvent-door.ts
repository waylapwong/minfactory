import { MinAdventDoorStatus } from '../enums/minadvent-door-status.enum';
import { MinAdventDoorContent } from './minadvent-block';

export class MinAdventDoor {
  public contents: MinAdventDoorContent[];
  public day: number;
  public status: MinAdventDoorStatus;
}
