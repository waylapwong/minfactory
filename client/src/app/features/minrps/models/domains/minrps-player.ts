import { MinRpsMove } from '../../../../core/generated';

export class MinRpsPlayer {
  public id: string = '';
  public move: MinRpsMove = MinRpsMove.None;
  public name: string = '';
  public selectedMove: MinRpsMove = MinRpsMove.None;

  constructor(init?: Partial<MinRpsPlayer>) {
    Object.assign(this, init);
  }
}
