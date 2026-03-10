import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RoutingService } from '../../../../core/services/routing.service';
import { Color } from '../../../../shared/enums/color.enum';
import { MinRpsHomeComponent } from './minrps-home.component';

describe('MinRpsHomeComponent', () => {
  let component: MinRpsHomeComponent;
  let fixture: ComponentFixture<MinRpsHomeComponent>;
  let mockRoutingService: jasmine.SpyObj<RoutingService>;

  beforeEach(async () => {
    mockRoutingService = jasmine.createSpyObj('RoutingService', [
      'navigateToMinRpsSingleplayer',
      'navigateToMinRpsOverview',
    ]);

    await TestBed.configureTestingModule({
      imports: [MinRpsHomeComponent],
      providers: [provideZonelessChangeDetection(), { provide: RoutingService, useValue: mockRoutingService }],
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
    expect(component.routingService).toBe(mockRoutingService);
  });

  it('should render root layout container in template', () => {
    const rootContainer = fixture.nativeElement.firstElementChild as HTMLElement;

    expect(rootContainer).toBeTruthy();
    expect(rootContainer.classList.contains('flex')).toBe(true);
    expect(rootContainer.classList.contains('h-full')).toBe(true);
    expect(rootContainer.classList.contains('flex-col')).toBe(true);
  });
});
