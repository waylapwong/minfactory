import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MinRPSMoveComponent } from './minrps-move.component';

describe('MinRPSMoveComponent', () => {
  let component: MinRPSMoveComponent;
  let fixture: ComponentFixture<MinRPSMoveComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MinRPSMoveComponent],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(MinRPSMoveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
