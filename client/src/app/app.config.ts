import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import {
  ApplicationConfig,
  importProvidersFrom,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
} from '@angular/core';
import { provideRouter } from '@angular/router';

import { SocketIoConfig, SocketIoModule } from 'ngx-socket-io';

import { ENVIRONMENT } from '../environments/environment';
import { APP_ROUTES } from './app.routes';
import { ApiModule, BASE_PATH } from './core/generated';

const socketIoConfig: SocketIoConfig = { url: 'http://localhost:3000', options: {} };

export const APP_CONFIG: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(APP_ROUTES),
    provideHttpClient(withInterceptorsFromDi()),
    importProvidersFrom(ApiModule),
    importProvidersFrom(SocketIoModule.forRoot(socketIoConfig)),
    { provide: BASE_PATH, useValue: ENVIRONMENT.API_BASE_PATH },
  ],
};
