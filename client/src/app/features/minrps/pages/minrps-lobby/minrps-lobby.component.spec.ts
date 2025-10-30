import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MinRpsLobbyComponent } from './minrps-lobby.component';

describe('MinRpsLobbyComponent', () => {
  let component: MinRpsLobbyComponent;
  let fixture: ComponentFixture<MinRpsLobbyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MinRpsLobbyComponent],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(MinRpsLobbyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
