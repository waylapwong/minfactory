import { Injectable, WritableSignal, signal } from '@angular/core';

import { AppName } from '../../shared/enums/app-name.enum';

@Injectable({
  providedIn: 'root',
})
export class ContextService {
  public app: WritableSignal<AppName> = signal(AppName.MinFactory);
}
