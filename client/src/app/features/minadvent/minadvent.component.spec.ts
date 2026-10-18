import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ContextService } from '../../core/context/services/context.service';
import { AppName } from '../../shared/enums/app-name.enum';
import { MinAdventComponent } from './minadvent.component';

describe('MinAdventComponent', () => {
  describe('ngOnInit()', () => {
    it('should set the active app context to MinAdvent', async () => {
      await TestBed.configureTestingModule({
        imports: [MinAdventComponent],
        providers: [provideZonelessChangeDetection()],
      }).compileComponents();

      const fixture = TestBed.createComponent(MinAdventComponent);
      fixture.detectChanges();

      expect(TestBed.inject(ContextService).app()).toBe(AppName.MinAdvent);
    });
  });

  describe('template', () => {
    it('should render the router outlet', async () => {
      await TestBed.configureTestingModule({
        imports: [MinAdventComponent],
        providers: [provideZonelessChangeDetection()],
      }).compileComponents();

      const fixture = TestBed.createComponent(MinAdventComponent);
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelector('router-outlet')).toBeTruthy();
    });
  });
});
