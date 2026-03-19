import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RoutingService } from '../../../../core/services/routing.service';
import { MinFactoryProfileService } from '../../services/minfactory-profile.service';
import { ProfileComponent } from './profile.component';

describe('ProfileComponent', () => {
  let component: ProfileComponent;
  let fixture: ComponentFixture<ProfileComponent>;
  let profileServiceMock: { loadProfile: jasmine.Spy };
  let routingServiceMock: { navigateToApps: jasmine.Spy; navigateToLogin: jasmine.Spy };

  beforeEach(async () => {
    profileServiceMock = {
      loadProfile: jasmine.createSpy('loadProfile').and.returnValue(
        Promise.resolve({
          createdAt: '19.03.2026, 11:00',
          email: 'user@example.com',
          id: 'minfactory-user-id',
        }),
      ),
    };

    routingServiceMock = {
      navigateToApps: jasmine.createSpy('navigateToApps'),
      navigateToLogin: jasmine.createSpy('navigateToLogin'),
    };

    await TestBed.configureTestingModule({
      imports: [ProfileComponent],
      providers: [
        provideZonelessChangeDetection(),
        { provide: MinFactoryProfileService, useValue: profileServiceMock },
        { provide: RoutingService, useValue: routingServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProfileComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load profile on init', async () => {
    fixture.detectChanges();
    await fixture.whenStable();

    expect(profileServiceMock.loadProfile).toHaveBeenCalled();
    expect(component.profile()?.email).toBe('user@example.com');
    expect(component.isLoading()).toBeFalse();
    expect(component.isError()).toBeFalse();
  });

  it('should navigate to login when profile loading fails with unauthorized error', async () => {
    profileServiceMock.loadProfile.and.returnValue(Promise.reject(new Error('401 Unauthorized')));

    fixture.detectChanges();
    await fixture.whenStable();

    expect(routingServiceMock.navigateToLogin).toHaveBeenCalled();
  });

  it('should expose error state when profile loading fails', async () => {
    profileServiceMock.loadProfile.and.returnValue(Promise.reject(new Error('Server down')));

    fixture.detectChanges();
    await fixture.whenStable();

    expect(component.isError()).toBeTrue();
    expect(component.errorMessage()).toBe('Server down');
    expect(component.profile()).toBeNull();
  });

  it('should navigate to apps', () => {
    component.navigateToApps();

    expect(routingServiceMock.navigateToApps).toHaveBeenCalled();
  });

  it('should reload profile when reloadProfile is called', async () => {
    fixture.detectChanges();
    await fixture.whenStable();
    profileServiceMock.loadProfile.calls.reset();

    component.reloadProfile();
    await fixture.whenStable();

    expect(profileServiceMock.loadProfile).toHaveBeenCalled();
  });
});
