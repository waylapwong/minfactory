import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Auth } from '@angular/fire/auth';
import { provideRouter } from '@angular/router';
import { AppComponent } from './app.component';
import { ContextService } from './core/context/context.service';
import { AppName } from './shared/enums/app-name.enum';

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [
        provideZonelessChangeDetection(),
        provideRouter([]),
        {
          provide: Auth,
          useValue: {
            currentUser: null,
            onAuthStateChanged: () => () => undefined,
            signOut: () => Promise.resolve(),
          },
        },
      ],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should show footer in minFactory context', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();

    const footer = fixture.nativeElement.querySelector('#footer');
    expect(footer).toBeTruthy();
  });

  it('should hide footer in non-minFactory context', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const contextService: ContextService = TestBed.inject(ContextService);
    contextService.app.set(AppName.MinRps);

    fixture.detectChanges();

    const footer = fixture.nativeElement.querySelector('#footer');
    expect(footer).toBeFalsy();
  });
});
