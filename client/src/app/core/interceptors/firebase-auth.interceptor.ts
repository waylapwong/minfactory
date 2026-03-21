import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, defer, from, of } from 'rxjs';
import { ENVIRONMENT } from '../../../environments/environment';
import { AuthenticationService } from '../authentication/authentication.service';
import { catchError, switchMap } from 'rxjs/operators';

@Injectable()
export class FirebaseAuthInterceptor implements HttpInterceptor {
  constructor(private readonly authService: AuthenticationService) {}

  public intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    if (!this.isApiRequest(request.url) || request.headers.has('Authorization')) {
      return next.handle(request);
    }

    return defer(() => from(this.authService.getIdToken())).pipe(
      catchError(() => of(null)),
      switchMap((idToken: string | null) => {
        if (!idToken) {
          return next.handle(request);
        }

        const authenticatedRequest = request.clone({
          setHeaders: {
            Authorization: `Bearer ${idToken}`,
          },
        });

        return next.handle(authenticatedRequest);
      }),
    );
  }

  private isApiRequest(url: string): boolean {
    return url.startsWith(ENVIRONMENT.API_BASE_PATH);
  }
}
