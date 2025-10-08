import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { AppPath } from '../../../app.routes';
import { AppName } from '../../../shared/enums/app-name.enum';
import { ContextServiceMock } from '../../../shared/mocks/context.service.mock';
import { HeaderComponent } from './header.component';

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeaderComponent],
      providers: [
        provideZonelessChangeDetection(),
        provideRouter([]),
        {
          provide: 'ContextService',
          useClass: ContextServiceMock,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('logo()', () => {
    it('should compute the correct logo for minFactory', () => {
      (component as any).contextService.app.set(AppName.MinFactory);
      expect(component.logo()).toBe('Factory');
    });

    it('should compute the correct logo for minRPS', () => {
      (component as any).contextService.app.set(AppName.MinRPS);
      expect(component.logo()).toBe('RPS');
    });

    it('should default to logo for minFactory', () => {
      (component as any).contextService.app.set(undefined);
      expect(component.logo()).toBe('Factory');
    });
  });

  describe('routerLink()', () => {
    it('should compute the correct link for minFactory', () => {
      (component as any).contextService.app.set(AppName.MinFactory);
      expect(component.routerLink()).toBe(AppPath.Root);
    });

    it('should compute the correct link for minRPS', () => {
      (component as any).contextService.app.set(AppName.MinRPS);
      expect(component.routerLink()).toBe(AppPath.MinRPS);
    });

    it('should default to link for minFactory', () => {
      (component as any).contextService.app.set(undefined);
      expect(component.routerLink()).toBe(AppPath.Root);
    });
  });
});
