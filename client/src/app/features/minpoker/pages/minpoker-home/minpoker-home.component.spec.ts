import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Color } from '../../../../shared/enums/color.enum';
import { MinPokerHomeComponent } from './minpoker-home.component';

describe('MinPokerHomeComponent', () => {
  let component: MinPokerHomeComponent;
  let fixture: ComponentFixture<MinPokerHomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MinPokerHomeComponent],
      providers: [provideZonelessChangeDetection()],
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

  it('should render root layout container in template', () => {
    const rootContainer = fixture.nativeElement.firstElementChild as HTMLElement;

    expect(rootContainer).toBeTruthy();
    expect(rootContainer.classList.contains('flex')).toBe(true);
    expect(rootContainer.classList.contains('h-full')).toBe(true);
    expect(rootContainer.classList.contains('flex-col')).toBe(true);
  });
});