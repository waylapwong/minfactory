import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MinRPSMultiplayerComponent } from './minrps-multiplayer.component';

describe('MinRPSHomeComponent', () => {
  let component: MinRPSMultiplayerComponent;
  let fixture: ComponentFixture<MinRPSMultiplayerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MinRPSMultiplayerComponent],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(MinRPSMultiplayerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
