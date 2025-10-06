import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MinRPSGameComponent } from './minrps-game.component';

describe('MinRPSGameComponent', () => {
  let component: MinRPSGameComponent;
  let fixture: ComponentFixture<MinRPSGameComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MinRPSGameComponent],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(MinRPSGameComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
