import { Injectable, WritableSignal, signal } from '@angular/core';

import { Application } from '../../shared/enums/application.enum';

@Injectable({
  providedIn: 'root'
})
export class ContextService {
  public app: WritableSignal<Application> = signal(Application.MinFactory);
}
