import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RoutingService } from '../../../../core/routing/routing.service';
import { ROUTING_SERVICE_MOCK } from '../../../../core/routing/routing.service.mock';
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
