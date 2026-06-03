import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { AppName } from '../../../shared/enums/app-name.enum';
import { ContextService } from './context.service';

describe('ContextService', () => {
  let service: ContextService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()],
    });
    service = TestBed.inject(ContextService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('app signal', () => {
    it('should default to MinFactory', () => {
      expect(service.app()).toBe(AppName.MinFactory);
    });
  });

  describe('appVersion signal', () => {
    it('should return MinFactory version when app is MinFactory', () => {
      service.app.set(AppName.MinFactory);
      expect(service.appVersion()).toContain(AppName.MinFactory);
    });

    it('should return MinPoker version when app is MinPoker', () => {
      service.app.set(AppName.MinPoker);
      expect(service.appVersion()).toContain(AppName.MinPoker);
    });

    it('should return MinRps version when app is MinRps', () => {
      service.app.set(AppName.MinRps);
      expect(service.appVersion()).toContain(AppName.MinRps);
    });
  });
});
