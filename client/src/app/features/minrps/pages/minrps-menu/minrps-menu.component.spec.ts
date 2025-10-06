import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MinRPSMenuComponent } from './minrps-menu.component';

describe('MinRPSMenuComponent', () => {
  let component: MinRPSMenuComponent;
  let fixture: ComponentFixture<MinRPSMenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MinRPSMenuComponent],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(MinRPSMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
