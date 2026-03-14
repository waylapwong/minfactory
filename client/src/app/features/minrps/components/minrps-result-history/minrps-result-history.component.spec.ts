import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MinRpsResult } from '../../../../core/generated';
import { MinRpsResultHistoryComponent } from './minrps-result-history.component';

describe('MinRpsResultHistoryComponent', () => {
  let component: MinRpsResultHistoryComponent;
  let fixture: ComponentFixture<MinRpsResultHistoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MinRpsResultHistoryComponent],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(MinRpsResultHistoryComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('resultHistory', [MinRpsResult.Player1, MinRpsResult.Draw, MinRpsResult.Player2]);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render one rectangle per result', () => {
    const resultElements: NodeListOf<HTMLElement> = fixture.nativeElement.querySelectorAll(
      '[data-testid="result-history-item"]',
    );

    expect(resultElements.length).toBe(3);
  });

  it('should apply the correct color classes', () => {
    const resultElements: NodeListOf<HTMLElement> = fixture.nativeElement.querySelectorAll(
      '[data-testid="result-history-item"]',
    );

    expect(resultElements[0].className).toContain('bg-green-300');
    expect(resultElements[1].className).toContain('bg-yellow-300');
    expect(resultElements[2].className).toContain('bg-red-300');
  });

  it('should show empty state text when no results exist', () => {
    fixture.componentRef.setInput('resultHistory', []);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Noch keine Ergebnisse');
  });
});
