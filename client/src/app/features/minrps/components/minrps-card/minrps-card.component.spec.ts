import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MinRPSCardComponent } from './minrps-card.component';

describe('MinRPSCardComponent', () => {
  let component: MinRPSCardComponent;
  let fixture: ComponentFixture<MinRPSCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MinRPSCardComponent],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(MinRPSCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
