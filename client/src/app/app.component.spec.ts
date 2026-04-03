import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AppComponent } from './app.component';
import { AuthenticationService } from './core/authentication/authentication.service';
import { ContextService } from './core/context/context.service';
import { AUTHENTICATION_SERVICE_MOCK } from './core/mocks/authentication.service.mock';
import { MINFACTORY_USER_SERVICE_MOCK } from './features/minfactory/mocks/minfactory-user.service.mock';
import { MinFactoryUserService } from './features/minfactory/services/minfactory-user.service';
import { AppName } from './shared/enums/app-name.enum';

describe('AppComponent', () => {
  const flushMicrotasks = async (): Promise<void> => {
    await Promise.resolve();
    await Promise.resolve();
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [
        provideZonelessChangeDetection(),
        provideRouter([]),
        { provide: AuthenticationService, useValue: AUTHENTICATION_SERVICE_MOCK },
        { provide: MinFactoryUserService, useValue: MINFACTORY_USER_SERVICE_MOCK },
      ],
    }).compileComponents();

    AUTHENTICATION_SERVICE_MOCK.setCurrentUser(null);
    MINFACTORY_USER_SERVICE_MOCK.setProfile(null);
    MINFACTORY_USER_SERVICE_MOCK.ensureProfileLoaded.calls.reset();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should show footer in minFactory context', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();

    const footer = fixture.nativeElement.querySelector('#footer');
    expect(footer).toBeTruthy();
  });

  it('should hide footer in non-minFactory context', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const contextService: ContextService = TestBed.inject(ContextService);
    contextService.app.set(AppName.MinRps);

    fixture.detectChanges();

    const footer = fixture.nativeElement.querySelector('#footer');
    expect(footer).toBeFalsy();
  });

  it('should load profile when auth state becomes authenticated', async () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();

    AUTHENTICATION_SERVICE_MOCK.setCurrentUser({ uid: 'admin-1' } as any);
    fixture.detectChanges();
    await flushMicrotasks();

    expect(MINFACTORY_USER_SERVICE_MOCK.ensureProfileLoaded).toHaveBeenCalled();
  });

  it('should not load profile when user is not authenticated', async () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    await flushMicrotasks();

    expect(MINFACTORY_USER_SERVICE_MOCK.ensureProfileLoaded).not.toHaveBeenCalled();
  });
});
