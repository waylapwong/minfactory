import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ROUTING_SERVICE_MOCK } from '../../../../core/mocks/routing.service.mock';
import { RoutingService } from '../../../../core/routing/routing.service';
import { Color } from '../../../../shared/enums/color.enum';
import { MinPokerGameComponent } from './minpoker-game.component';

describe('MinPokerGameComponent', () => {
  let component: MinPokerGameComponent;
  let fixture: ComponentFixture<MinPokerGameComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MinPokerGameComponent],
      providers: [
        provideZonelessChangeDetection(),
        { provide: RoutingService, useValue: ROUTING_SERVICE_MOCK },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MinPokerGameComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have Color enum available', () => {
    expect(component.Color).toBe(Color);
  });

  it('should render root layout container in template', () => {
    const rootContainer = fixture.nativeElement.firstElementChild as HTMLElement;

    expect(rootContainer).toBeTruthy();
    expect(rootContainer.classList.contains('flex')).toBe(true);
    expect(rootContainer.classList.contains('h-full')).toBe(true);
    expect(rootContainer.classList.contains('flex-col')).toBe(true);
  });

  it('should have 5 opponents', () => {
    expect(component.opponents.length).toBe(5);
  });

  it('should render community cards', () => {
    expect(component.communityCards.length).toBe(5);
    expect(component.communityCards).toEqual(['?', '?', '?', '?', '?']);
  });

  it('should render hand cards', () => {
    expect(component.handCards.length).toBe(2);
    expect(component.handCards).toEqual(['?', '?']);
  });

  it('should have initial betAmount of 120', () => {
    expect(component.betAmount()).toBe(120);
  });

  it('should have initial callAmount of 40', () => {
    expect(component.callAmount()).toBe(40);
  });

  it('should have potAmount of 240', () => {
    expect(component.potAmount()).toBe(240);
  });

  it('should update betAmount on onBetChange', () => {
    const event = { target: { value: '300' } } as unknown as Event;
    component.onBetChange(event);
    expect(component.betAmount()).toBe(300);
  });

  it('should set betAmount to min on onSetBet min', () => {
    component.onSetBet('min');
    expect(component.betAmount()).toBe(40);
  });

  it('should set betAmount to half pot on onSetBet half-pot', () => {
    component.onSetBet('half-pot');
    expect(component.betAmount()).toBe(120);
  });

  it('should set betAmount to pot on onSetBet pot', () => {
    component.onSetBet('pot');
    expect(component.betAmount()).toBe(240);
  });

  it('should set betAmount to all-in on onSetBet all-in', () => {
    component.onSetBet('all-in');
    expect(component.betAmount()).toBe(1560);
  });

  it('should call navigateToMinPoker on onFold', () => {
    component.onFold();
    expect(ROUTING_SERVICE_MOCK.navigateToMinPoker).toHaveBeenCalled();
  });
});
