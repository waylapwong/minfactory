import { WritableSignal, signal } from '@angular/core';

import { AppName } from '../../shared/enums/app-name.enum';

export class ContextServiceMock {
  public app: WritableSignal<AppName> = signal(AppName.MinFactory);
}
