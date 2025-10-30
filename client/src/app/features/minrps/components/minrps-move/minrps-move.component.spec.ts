import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MinRpsMoveComponent } from './minrps-move.component';

describe('MinRpsMoveComponent', () => {
  let component: MinRpsMoveComponent;
  let fixture: ComponentFixture<MinRpsMoveComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MinRpsMoveComponent],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(MinRpsMoveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
