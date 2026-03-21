import { WritableSignal, computed, signal } from '@angular/core';
import { AppName } from '../../shared/enums/app-name.enum';

const app: WritableSignal<AppName> = signal(AppName.MinFactory);
const appVersions: Readonly<Record<AppName, string>> = {
  [AppName.MinFactory]: `${AppName.MinFactory} v0.2.0`,
  [AppName.MinPoker]: `${AppName.MinPoker} v0.0.0`,
  [AppName.MinRps]: `${AppName.MinRps} v0.2.1`,
};

export const CONTEXT_SERVICE_MOCK = {
  app,
  appVersion: computed(() => appVersions[app()]),
};
