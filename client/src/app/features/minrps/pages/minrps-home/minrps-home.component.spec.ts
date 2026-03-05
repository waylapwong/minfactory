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

  it('should have correct host class', () => {
    const element = fixture.nativeElement;
    expect(element.classList.contains('flex')).toBe(true);
    expect(element.classList.contains('h-full')).toBe(true);
    expect(element.classList.contains('flex-row')).toBe(true);
    expect(element.classList.contains('items-center')).toBe(true);
    expect(element.classList.contains('justify-evenly')).toBe(true);
  });
});
