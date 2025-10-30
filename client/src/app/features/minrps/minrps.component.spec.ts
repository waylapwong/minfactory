import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MinRpsComponent } from './minrps.component';

describe('MinRpsComponent', () => {
  let component: MinRpsComponent;
  let fixture: ComponentFixture<MinRpsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MinRpsComponent],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(MinRpsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
