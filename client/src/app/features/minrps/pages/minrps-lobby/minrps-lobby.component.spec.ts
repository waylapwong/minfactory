import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MinRPSLobbyComponent } from './minrps-lobby.component';

describe('MinRPSLobbyComponent', () => {
  let component: MinRPSLobbyComponent;
  let fixture: ComponentFixture<MinRPSLobbyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MinRPSLobbyComponent],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(MinRPSLobbyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
