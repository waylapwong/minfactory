import { MinAdventDoor } from './minadvent-door';

export class MinAdventCalendar {
  public activeToken: string | null = null;
  public completed: boolean = false;
  public createdAt: Date = new Date();
  public doors: MinAdventDoor[] = [];
  public id: string = '';
  public isPublished: boolean = false;
  public ownerId: string = '';
  public recipientName: string = '';
  public title: string = '';
  public updatedAt: Date = new Date();
  public version: number = 1;
  public year: number = new Date().getFullYear();
}
