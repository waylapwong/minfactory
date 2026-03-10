import { registerLocaleData } from '@angular/common';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import localeDe from '@angular/common/locales/de';
import {
  ApplicationConfig,
  importProvidersFrom,
  LOCALE_ID,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { ENVIRONMENT } from '../environments/environment';
import { APP_ROUTES } from './app.routes';
import { ApiModule, BASE_PATH } from './core/generated';

registerLocaleData(localeDe);

export const APP_CONFIG: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(APP_ROUTES),
    provideHttpClient(withInterceptorsFromDi()),
    importProvidersFrom(ApiModule),
    { provide: BASE_PATH, useValue: ENVIRONMENT.API_BASE_PATH },
    { provide: LOCALE_ID, useValue: 'de-DE' },
  ],
};
