import { HTTP_INTERCEPTORS, HttpClient, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { RequestIdInterceptor } from './request-id.interceptor';

describe('RequestIdInterceptor', () => {
  let httpClient: HttpClient;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
        { provide: HTTP_INTERCEPTORS, useClass: RequestIdInterceptor, multi: true },
      ],
    });

    httpClient = TestBed.inject(HttpClient);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should attach an X-Request-Id header to every request', async () => {
    const responsePromise = firstValueFrom(httpClient.get('/api/test'));

    const request = httpTestingController.expectOne('/api/test');

    expect(request.request.headers.has('X-Request-Id')).toBeTrue();

    request.flush({});
    await responsePromise;
  });

  it('should generate a valid UUID for the X-Request-Id header', async () => {
    const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

    const responsePromise = firstValueFrom(httpClient.get('/api/test'));

    const request = httpTestingController.expectOne('/api/test');
    const requestId = request.request.headers.get('X-Request-Id');

    expect(requestId).toMatch(uuidPattern);

    request.flush({});
    await responsePromise;
  });

  it('should generate a unique X-Request-Id for each request', async () => {
    const responsePromise1 = firstValueFrom(httpClient.get('/api/test'));
    const responsePromise2 = firstValueFrom(httpClient.get('/api/test'));

    const requests = httpTestingController.match('/api/test');

    const requestId1 = requests[0].request.headers.get('X-Request-Id');
    const requestId2 = requests[1].request.headers.get('X-Request-Id');

    expect(requestId1).not.toEqual(requestId2);

    requests[0].flush({});
    requests[1].flush({});
    await Promise.all([responsePromise1, responsePromise2]);
  });
});
