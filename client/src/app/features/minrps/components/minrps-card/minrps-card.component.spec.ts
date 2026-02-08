import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MinRpsCardComponent } from './minrps-card.component';

describe('MinRpsCardComponent', () => {
  let component: MinRpsCardComponent;
  let fixture: ComponentFixture<MinRpsCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MinRpsCardComponent],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(MinRpsCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
