import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable()
export class RequestIdInterceptor implements HttpInterceptor {
  public intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const requestWithId = request.clone({
      setHeaders: {
        'X-Request-Id': crypto.randomUUID(),
      },
    });

    return next.handle(requestWithId);
  }
}
