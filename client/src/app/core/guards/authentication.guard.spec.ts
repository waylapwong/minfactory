import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { AuthenticationService } from '../authentication/authentication.service';
import { RoutingService } from '../routing/routing.service';
import { AUTHENTICATION_SERVICE_MOCK } from '../mocks/authentication.service.mock';
import { ROUTING_SERVICE_MOCK } from '../mocks/routing.service.mock';
import { authenticationGuard } from './authentication.guard';

describe('authenticationGuard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        { provide: AuthenticationService, useValue: AUTHENTICATION_SERVICE_MOCK },
        { provide: RoutingService, useValue: ROUTING_SERVICE_MOCK },
      ],
    });
  });

  afterEach(() => {
    ROUTING_SERVICE_MOCK.navigateToLogin.calls.reset();
    (AUTHENTICATION_SERVICE_MOCK.getIdToken as jasmine.Spy).calls.reset();
  });

  it('should allow route when user is authenticated', async () => {
    (AUTHENTICATION_SERVICE_MOCK.getIdToken as jasmine.Spy).and.resolveTo('token');

    const result = await TestBed.runInInjectionContext(() => authenticationGuard({} as never, {} as never));

    expect(result).toBeTrue();
  });

  it('should navigate to login when user is not authenticated', async () => {
    (AUTHENTICATION_SERVICE_MOCK.getIdToken as jasmine.Spy).and.resolveTo(null);

    const result = await TestBed.runInInjectionContext(() => authenticationGuard({} as never, {} as never));

    expect(result).toBeFalse();
    expect(ROUTING_SERVICE_MOCK.navigateToLogin).toHaveBeenCalled();
  });
});
