import { MinAdventDoor } from './minadvent-door';

export class MinAdventCalendar {
  public activeToken: string;
  public completed: boolean;
  public createdAt: Date;
  public doors: MinAdventDoor[];
  public id: string;
  public isPublished: boolean;
  public ownerId: string;
  public recipientName: string;
  public title: string;
  public updatedAt: Date;
  public version: number;
  public year: number;
}
