export class MinFactoryUser {
  public createdAt: Date = new Date();
  public email: string = '';

  constructor(init?: Partial<MinFactoryUser>) {
    if (init) {
      Object.assign(this, init);
    }
  }
}
