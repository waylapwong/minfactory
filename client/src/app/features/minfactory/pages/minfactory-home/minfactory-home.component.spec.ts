import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MinFactoryHomeComponent } from './minfactory-home.component';

describe('MinFactoryHomeComponent', () => {
  let component: MinFactoryHomeComponent;
  let fixture: ComponentFixture<MinFactoryHomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MinFactoryHomeComponent],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(MinFactoryHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
