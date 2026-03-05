import { MinRpsMove } from '../../../../core/generated';

export class MinRpsPlayer {
  public id: string = '';
  public move: MinRpsMove = MinRpsMove.None;
  public name: string = '';

  constructor(init?: Partial<MinRpsPlayer>) {
    Object.assign(this, init);
  }
}
