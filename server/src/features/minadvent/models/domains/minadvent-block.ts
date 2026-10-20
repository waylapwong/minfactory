import { MinAdventBlockType } from '../enums/minadvent-block-type.enum';

export class MinAdventBlock {
  public description: string | null = null;
  public position: number = 1;
  public text: string | null = null;
  public title: string | null = null;
  public type: MinAdventBlockType = MinAdventBlockType.Text;
  public url: string | null = null;
}
