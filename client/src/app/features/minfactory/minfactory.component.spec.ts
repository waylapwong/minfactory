import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MinFactoryComponent } from './minfactory.component';

describe('MinFactoryComponent', () => {
  let component: MinFactoryComponent;
  let fixture: ComponentFixture<MinFactoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MinFactoryComponent],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(MinFactoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
