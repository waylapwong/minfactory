import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RoutingService } from '../../../../core/routing/routing.service';
import { MINFACTORY_ROUTING_SERVICE_MOCK } from '../../services/minfactory-routing.service.mock';
import { MinFactoryAppsComponent } from './minfactory-apps.component';

describe('MinFactoryAppsComponent', () => {
  let component: MinFactoryAppsComponent;
  let fixture: ComponentFixture<MinFactoryAppsComponent>;

  beforeEach(async () => {
    MINFACTORY_ROUTING_SERVICE_MOCK.navigateToApps.calls.reset();
    MINFACTORY_ROUTING_SERVICE_MOCK.navigateToHomePage.calls.reset();
    MINFACTORY_ROUTING_SERVICE_MOCK.navigateToLogin.calls.reset();
    MINFACTORY_ROUTING_SERVICE_MOCK.navigateToProfile.calls.reset();
    MINFACTORY_ROUTING_SERVICE_MOCK.navigateToRegister.calls.reset();

    await TestBed.configureTestingModule({
      imports: [MinFactoryAppsComponent],
      providers: [
        provideZonelessChangeDetection(),
        { provide: RoutingService, useValue: MINFACTORY_ROUTING_SERVICE_MOCK },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MinFactoryAppsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
