import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ROUTING_SERVICE_MOCK } from '../../../../core/routing/mocks/routing.service.mock';
import { RoutingService } from '../../../../core/routing/services/routing.service';
import { MinFactoryRole } from '../../../../shared/enums/minfactory-role.enum';
import { MINFACTORY_USER_SERVICE_MOCK } from '../../mocks/minfactory-user.service.mock';
import { MinFactoryUserService } from '../../services/minfactory-user.service';
import { MinFactoryAppsComponent } from './minfactory-apps.component';

describe('MinFactoryAppsComponent', () => {
  let component: MinFactoryAppsComponent;
  let fixture: ComponentFixture<MinFactoryAppsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MinFactoryAppsComponent],
      providers: [
        provideZonelessChangeDetection(),
        { provide: RoutingService, useValue: ROUTING_SERVICE_MOCK },
        { provide: MinFactoryUserService, useValue: MINFACTORY_USER_SERVICE_MOCK },
      ],
    }).compileComponents();

    MINFACTORY_USER_SERVICE_MOCK.setProfile(null);

    fixture = TestBed.createComponent(MinFactoryAppsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show the branded minGames and minTools tabs', () => {
    const tabLabels = fixture.nativeElement.textContent as string;
    expect(tabLabels).toContain('minGames');
    expect(tabLabels).toContain('minTools');
  });

  it('should disable minPoker for visitors and regular users', () => {
    expect(component.isMinPokerAccessible()).toBeFalse();
    expect(fixture.nativeElement.querySelector('min-card-button button').disabled).toBeTrue();

    MINFACTORY_USER_SERVICE_MOCK.setProfile({
      createdAt: '19.03.2026, 11:00',
      email: 'user@example.com',
      role: MinFactoryRole.User,
    });
    fixture.detectChanges();

    expect(component.isMinPokerAccessible()).toBeFalse();
  expect(fixture.nativeElement.querySelector('min-card-button button').disabled).toBeTrue();
  });

  it('should enable minPoker card when user has Admin role', () => {
    MINFACTORY_USER_SERVICE_MOCK.setProfile({
      createdAt: '19.03.2026, 11:00',
      email: 'admin@example.com',
      role: MinFactoryRole.Admin,
    });
    fixture.detectChanges();

    expect(component.isMinPokerAccessible()).toBeTrue();
  });

  it('should keep minAdvent disabled for visitors and regular users', () => {
    component.selectedTab.set(2);
    fixture.detectChanges();
    expect(component.isMinAdventAccessible()).toBeFalse();

    MINFACTORY_USER_SERVICE_MOCK.setProfile({
      createdAt: '19.03.2026, 11:00',
      email: 'user@example.com',
      role: MinFactoryRole.User,
    });
    fixture.detectChanges();

    expect(component.isMinAdventAccessible()).toBeFalse();
    expect(fixture.nativeElement.querySelector('min-card-button button').disabled).toBeTrue();
  });

  it('should enable minAdvent for Admin users', () => {
    component.selectedTab.set(2);
    MINFACTORY_USER_SERVICE_MOCK.setProfile({
      createdAt: '19.03.2026, 11:00',
      email: 'admin@example.com',
      role: MinFactoryRole.Admin,
    });
    fixture.detectChanges();

    expect(component.isMinAdventAccessible()).toBeTrue();
    expect(fixture.nativeElement.querySelector('min-card-button button').disabled).toBeFalse();
    expect(fixture.nativeElement.textContent).toContain('soon');
  });
});
