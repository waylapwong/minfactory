import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RoutingService } from '../../../../core/services/routing.service';
import { ROUTING_SERVICE_MOCK } from '../../../../core/services/routing.service.mock';
import { AppsComponent } from './apps.component';

describe('AppsComponent', () => {
  let component: AppsComponent;
  let fixture: ComponentFixture<AppsComponent>;

  beforeEach(async () => {
    ROUTING_SERVICE_MOCK.navigateToApps.calls.reset();
    ROUTING_SERVICE_MOCK.navigateToHomePage.calls.reset();
    ROUTING_SERVICE_MOCK.navigateToLogin.calls.reset();
    ROUTING_SERVICE_MOCK.navigateToProfile.calls.reset();
    ROUTING_SERVICE_MOCK.navigateToRegister.calls.reset();
    ROUTING_SERVICE_MOCK.navigateToMinRps.calls.reset();
    ROUTING_SERVICE_MOCK.navigateToMinRpsMultiplayer.calls.reset();
    ROUTING_SERVICE_MOCK.navigateToMinRpsOverview.calls.reset();
    ROUTING_SERVICE_MOCK.navigateToMinRpsSingleplayer.calls.reset();

    await TestBed.configureTestingModule({
      imports: [AppsComponent],
      providers: [
        provideZonelessChangeDetection(),
        {
          provide: RoutingService,
          useValue: ROUTING_SERVICE_MOCK,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AppsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
