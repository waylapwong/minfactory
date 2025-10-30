import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MinRpsHomeComponent } from './minrps-home.component';

describe('MinRpsHomeComponent', () => {
  let component: MinRpsHomeComponent;
  let fixture: ComponentFixture<MinRpsHomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MinRpsHomeComponent],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(MinRpsHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
