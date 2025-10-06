import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MinRPSHomeComponent } from './minrps-home.component';

describe('MinRPSHomeComponent', () => {
  let component: MinRPSHomeComponent;
  let fixture: ComponentFixture<MinRPSHomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MinRPSHomeComponent],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(MinRPSHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
