import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MinRpsMultiplayerComponent } from './minrps-multiplayer.component';

describe('MinRpsMultiplayerComponent', () => {
  let component: MinRpsMultiplayerComponent;
  let fixture: ComponentFixture<MinRpsMultiplayerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MinRpsMultiplayerComponent],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(MinRpsMultiplayerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
