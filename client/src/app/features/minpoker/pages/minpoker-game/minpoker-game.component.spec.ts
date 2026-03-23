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
      providers: [provideZonelessChangeDetection(), { provide: RoutingService, useValue: ROUTING_SERVICE_MOCK }],
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

  it('should have 6 opponents', () => {
    expect(component.opponents.length).toBe(6);
  });

  it('should include bet amounts for opponents with actions', () => {
    expect(component.opponents[0]).toEqual(
      jasmine.objectContaining({ name: 'Alex', lastAction: 'Call', betAmount: 40 }),
    );
    expect(component.opponents[1]).toEqual(
      jasmine.objectContaining({ name: 'Mia', lastAction: 'Raise', betAmount: 120 }),
    );
    expect(component.opponents[4]).toBeNull();
  });

  it('should open seat dialog only for empty seats', () => {
    component.openSeatDialog(4);
    expect(component.isSeatDialogOpen()).toBe(true);
    expect(component.selectedSeatIndex()).toBe(4);

    component.closeSeatDialog();
    component.openSeatDialog(0);
    expect(component.isSeatDialogOpen()).toBe(false);
  });

  it('should seat player on empty position', () => {
    component.openSeatDialog(4);
    component.seatName.setValue('Chris');
    component.seatAvatar.setValue('man-5.svg');

    component.seatGame();

    expect(component.opponents[4]).toEqual(
      jasmine.objectContaining({ name: 'Chris', avatar: 'man-5.svg', chips: 1000, lastAction: 'Sitzt' }),
    );
    expect(component.isSeatDialogOpen()).toBe(false);
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
    component.onBetChange(300);
    expect(component.betAmount()).toBe(300);
  });

  it('should call navigateToMinPoker on onFold', () => {
    component.onFold();
    expect(ROUTING_SERVICE_MOCK.navigateToMinPoker).toHaveBeenCalled();
  });
});
