import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MinRPSComponent } from './minrps.component';

describe('MinRPSComponent', () => {
  let component: MinRPSComponent;
  let fixture: ComponentFixture<MinRPSComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MinRPSComponent],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(MinRPSComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
