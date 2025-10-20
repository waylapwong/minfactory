import {
  ApplicationConfig,
  importProvidersFrom,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
} from '@angular/core';
import { provideRouter } from '@angular/router';

import { ENVIRONMENT } from '../environments/environment';
import { APP_ROUTES } from './app.routes';
import { ApiModule, BASE_PATH } from './core/generated';

export const APP_CONFIG: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(APP_ROUTES),
    importProvidersFrom(ApiModule),
    { provide: BASE_PATH, useValue: ENVIRONMENT.API_BASE_PATH },
  ],
};
