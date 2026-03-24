import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ROUTING_SERVICE_MOCK } from '../../../../core/mocks/routing.service.mock';
import { RoutingService } from '../../../../core/routing/routing.service';
import { Color } from '../../../../shared/enums/color.enum';
import { MinPokerHomeComponent } from './minpoker-home.component';

describe('MinPokerHomeComponent', () => {
  let component: MinPokerHomeComponent;
  let fixture: ComponentFixture<MinPokerHomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MinPokerHomeComponent],
      providers: [provideZonelessChangeDetection(), { provide: RoutingService, useValue: ROUTING_SERVICE_MOCK }],
    }).compileComponents();

    fixture = TestBed.createComponent(MinPokerHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have Color enum available', () => {
    expect(component.Color).toBe(Color);
  });
});
