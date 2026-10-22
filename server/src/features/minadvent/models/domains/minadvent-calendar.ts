import { MinAdventDoor } from './minadvent-door';

export class MinAdventCalendar {
  public completed: boolean;
  public createdAt: Date;
  public doors: MinAdventDoor[];
  public id: string;
  public ownerId: string;
  public recipient: string;
  public shareToken: string;
  public shared: boolean;
  public title: string;
  public updatedAt: Date;
  public version: number;
  public year: number;
}
