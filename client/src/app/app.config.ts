import { registerLocaleData } from '@angular/common';
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import localeDe from '@angular/common/locales/de';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import {
  ApplicationConfig,
  EnvironmentProviders,
  LOCALE_ID,
  Provider,
  importProvidersFrom,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { ENVIRONMENT } from '../environments/environment';
import { APP_ROUTES } from './app.routes';
import { ApiModule, BASE_PATH } from './core/generated';
import { FirebaseAuthInterceptor } from './core/interceptors/firebase-auth.interceptor';

registerLocaleData(localeDe);

function isConfiguredFirebaseValue(value: string | undefined): boolean {
  return typeof value === 'string' && value.length > 0 && !value.startsWith('REPLACE_WITH_');
}

function getFirebaseProviders(): (Provider | EnvironmentProviders)[] {
  const { FIREBASE_CONFIG } = ENVIRONMENT;

  const isFirebaseConfigured = [
    FIREBASE_CONFIG.apiKey,
    FIREBASE_CONFIG.authDomain,
    FIREBASE_CONFIG.projectId,
    FIREBASE_CONFIG.appId,
    FIREBASE_CONFIG.messagingSenderId,
    FIREBASE_CONFIG.storageBucket,
  ].every(isConfiguredFirebaseValue);

  if (!isFirebaseConfigured) {
    return [];
  }

  return [
    provideFirebaseApp(() => initializeApp(FIREBASE_CONFIG)),
    provideAuth(() => getAuth()),
    { provide: HTTP_INTERCEPTORS, useClass: FirebaseAuthInterceptor, multi: true },
  ];
}

export const APP_CONFIG: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(APP_ROUTES),
    provideHttpClient(withInterceptorsFromDi()),
    importProvidersFrom(ApiModule),
    { provide: BASE_PATH, useValue: ENVIRONMENT.API_BASE_PATH },
    ...getFirebaseProviders(),
    { provide: LOCALE_ID, useValue: 'de-DE' },
  ],
};
