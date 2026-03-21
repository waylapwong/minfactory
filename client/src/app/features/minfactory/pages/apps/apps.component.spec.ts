import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RoutingService } from '../../../../core/routing/routing.service';
import { MINFACTORY_ROUTING_SERVICE_MOCK } from '../../services/minfactory-routing.service.mock';
import { AppsComponent } from './apps.component';

describe('AppsComponent', () => {
  let component: AppsComponent;
  let fixture: ComponentFixture<AppsComponent>;

  beforeEach(async () => {
    MINFACTORY_ROUTING_SERVICE_MOCK.navigateToApps.calls.reset();
    MINFACTORY_ROUTING_SERVICE_MOCK.navigateToHomePage.calls.reset();
    MINFACTORY_ROUTING_SERVICE_MOCK.navigateToLogin.calls.reset();
    MINFACTORY_ROUTING_SERVICE_MOCK.navigateToProfile.calls.reset();
    MINFACTORY_ROUTING_SERVICE_MOCK.navigateToRegister.calls.reset();

    await TestBed.configureTestingModule({
      imports: [AppsComponent],
      providers: [
        provideZonelessChangeDetection(),
        { provide: RoutingService, useValue: MINFACTORY_ROUTING_SERVICE_MOCK },
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
