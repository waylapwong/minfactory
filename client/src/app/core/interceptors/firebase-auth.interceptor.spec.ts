import {
  HTTP_INTERCEPTORS,
  HttpClient,
  HttpHeaders,
  provideHttpClient,
  withInterceptorsFromDi,
} from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { ENVIRONMENT } from '../../../environments/environment';
import { AuthService } from '../services/auth.service';
import { FirebaseAuthInterceptor } from './firebase-auth.interceptor';

describe('FirebaseAuthInterceptor', () => {
  let httpClient: HttpClient;
  let httpTestingController: HttpTestingController;
  let authServiceMock: { getIdToken: jasmine.Spy };

  beforeEach(() => {
    authServiceMock = {
      getIdToken: jasmine.createSpy('getIdToken').and.resolveTo('firebase-token'),
    };

    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: authServiceMock },
        { provide: HTTP_INTERCEPTORS, useClass: FirebaseAuthInterceptor, multi: true },
      ],
    });

    httpClient = TestBed.inject(HttpClient);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should attach a bearer token to backend requests', async () => {
    const responsePromise = firstValueFrom(httpClient.get(`${ENVIRONMENT.API_BASE_PATH}/minfactory`));

    await Promise.resolve();

    const request = httpTestingController.expectOne(`${ENVIRONMENT.API_BASE_PATH}/minfactory`);

    expect(authServiceMock.getIdToken).toHaveBeenCalledOnceWith();
    expect(request.request.headers.get('Authorization')).toBe('Bearer firebase-token');

    request.flush({});
    await responsePromise;
  });

  it('should not attach a header when no firebase token exists', async () => {
    authServiceMock.getIdToken.and.resolveTo(null);

    const responsePromise = firstValueFrom(httpClient.get(`${ENVIRONMENT.API_BASE_PATH}/minfactory`));

    await Promise.resolve();

    const request = httpTestingController.expectOne(`${ENVIRONMENT.API_BASE_PATH}/minfactory`);

    expect(request.request.headers.has('Authorization')).toBeFalse();

    request.flush({});
    await responsePromise;
  });

  it('should not resolve a token for non-backend requests', async () => {
    const responsePromise = firstValueFrom(httpClient.get('/assets/config.json'));
    const request = httpTestingController.expectOne('/assets/config.json');

    expect(authServiceMock.getIdToken).not.toHaveBeenCalled();
    expect(request.request.headers.has('Authorization')).toBeFalse();

    request.flush({});
    await responsePromise;
  });

  it('should not overwrite an existing authorization header', async () => {
    const responsePromise = firstValueFrom(
      httpClient.get(`${ENVIRONMENT.API_BASE_PATH}/minfactory`, {
        headers: new HttpHeaders({
          Authorization: 'Bearer existing-token',
        }),
      }),
    );

    const request = httpTestingController.expectOne(`${ENVIRONMENT.API_BASE_PATH}/minfactory`);

    expect(authServiceMock.getIdToken).not.toHaveBeenCalled();
    expect(request.request.headers.get('Authorization')).toBe('Bearer existing-token');

    request.flush({});
    await responsePromise;
  });
});