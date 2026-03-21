import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RoutingService } from '../../../../core/routing/routing.service';
import { ROUTING_SERVICE_MOCK } from '../../../../core/mocks/routing.service.mock';
import { Color } from '../../../../shared/enums/color.enum';
import { MinRpsHomeComponent } from './minrps-home.component';

describe('MinRpsHomeComponent', () => {
  let component: MinRpsHomeComponent;
  let fixture: ComponentFixture<MinRpsHomeComponent>;

  beforeEach(async () => {
    ROUTING_SERVICE_MOCK.navigateToMinRpsSingleplayer.calls.reset();
    ROUTING_SERVICE_MOCK.navigateToMinRpsOverview.calls.reset();

    await TestBed.configureTestingModule({
      imports: [MinRpsHomeComponent],
      providers: [provideZonelessChangeDetection(), { provide: RoutingService, useValue: ROUTING_SERVICE_MOCK }],
    }).compileComponents();

    fixture = TestBed.createComponent(MinRpsHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have Color enum available', () => {
    expect(component.Color).toBe(Color);
  });

  it('should inject RoutingService', () => {
    expect(component.routingService).toBe(ROUTING_SERVICE_MOCK);
  });

  it('should render root layout container in template', () => {
    const rootContainer = fixture.nativeElement.firstElementChild as HTMLElement;

    expect(rootContainer).toBeTruthy();
    expect(rootContainer.classList.contains('flex')).toBe(true);
    expect(rootContainer.classList.contains('h-full')).toBe(true);
    expect(rootContainer.classList.contains('flex-col')).toBe(true);
  });
});
