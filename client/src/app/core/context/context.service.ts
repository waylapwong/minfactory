import { Injectable, Signal, WritableSignal, computed, signal } from '@angular/core';
import { AppName } from '../../shared/enums/app-name.enum';

@Injectable({
  providedIn: 'root',
})
export class ContextService {
  private readonly appVersions: Readonly<Record<AppName, string>> = {
    [AppName.MinFactory]: `${AppName.MinFactory} v0.2.0`,
    [AppName.MinPoker]: `${AppName.MinPoker} v0.0.0`,
    [AppName.MinRps]: `${AppName.MinRps} v0.2.1`,
  };

  public app: WritableSignal<AppName> = signal(AppName.MinFactory);
  public appVersion: Signal<string> = computed(() => this.appVersions[this.app()]);
}
