import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';

export const AUTHENTICATION_INTERCEPTOR_MOCK: HttpInterceptor = {
  intercept: jasmine
    .createSpy('intercept')
    .and.callFake(
      (request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> => next.handle(request),
    ),
};
