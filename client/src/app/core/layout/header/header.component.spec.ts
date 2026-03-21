import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { User as FirebaseUser } from '@angular/fire/auth';
import { provideRouter } from '@angular/router';
import { AppName } from '../../../shared/enums/app-name.enum';
import { AuthenticationService } from '../../authentication/authentication.service';
import { AUTHENTICATION_SERVICE_MOCK } from '../../mocks/authentication.service.mock';
import { ContextService } from '../../context/context.service';
import { CONTEXT_SERVICE_MOCK } from '../../mocks/context.service.mock';
import { HeaderComponent } from './header.component';

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;
  let contextService: typeof CONTEXT_SERVICE_MOCK;

  beforeEach(async () => {
    AUTHENTICATION_SERVICE_MOCK.setCurrentUser(null);
    CONTEXT_SERVICE_MOCK.app.set(AppName.MinFactory);

    await TestBed.configureTestingModule({
      imports: [HeaderComponent],
      providers: [
        provideZonelessChangeDetection(),
        provideRouter([]),
        { provide: AuthenticationService, useValue: AUTHENTICATION_SERVICE_MOCK },
        { provide: ContextService, useValue: CONTEXT_SERVICE_MOCK },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    contextService = TestBed.inject(ContextService) as typeof CONTEXT_SERVICE_MOCK;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('isInFactory computed signal', () => {
    it('should return true when app is MinFactory', () => {
      contextService.app.set(AppName.MinFactory);
      expect(component.isInFactory()).toBe(true);
    });

    it('should return false when app is MinRps', () => {
      contextService.app.set(AppName.MinRps);
      expect(component.isInFactory()).toBe(false);
    });
  });

  describe('isInMinRps computed signal', () => {
    it('should return true when app is MinRps', () => {
      contextService.app.set(AppName.MinRps);
      expect(component.isInMinRps()).toBe(true);
    });

    it('should return false when app is MinFactory', () => {
      contextService.app.set(AppName.MinFactory);
      expect(component.isInMinRps()).toBe(false);
    });
  });

  describe('Breadcrumb links routing', () => {
    it('should expose AppPath constant', () => {
      expect(component.AppPath).toBeDefined();
      expect(component.AppPath.Root).toBe('');
      expect(component.AppPath.MinRps).toBe('minrps');
    });

    it('should render Factory link with correct routing', () => {
      const links = fixture.nativeElement.querySelectorAll('a');
      const factoryLink = links[0];
      expect(factoryLink).toBeTruthy();
      expect(factoryLink.href).toContain('');
    });

    it('should render RPS link with correct routing when in minRps', () => {
      contextService.app.set(AppName.MinRps);
      fixture.detectChanges();
      const links = fixture.nativeElement.querySelectorAll('a');
      expect(links.length).toBeGreaterThanOrEqual(2);
      const rpsLink = links[1];
      expect(rpsLink).toBeTruthy();
    });

    it('should have aria-current="page" on Factory link when in factory', () => {
      contextService.app.set(AppName.MinFactory);
      fixture.detectChanges();
      const links = fixture.nativeElement.querySelectorAll('a');
      const factoryLink = links[0];
      expect(factoryLink.getAttribute('aria-current')).toBe('page');
    });

    it('should have aria-current="page" on RPS link when in minRps', () => {
      contextService.app.set(AppName.MinRps);
      fixture.detectChanges();
      const links = fixture.nativeElement.querySelectorAll('a');
      const rpsLink = links[1];
      expect(rpsLink.getAttribute('aria-current')).toBe('page');
    });

    it('should have semantic link styling with hover:text-black', () => {
      const links = fixture.nativeElement.querySelectorAll('a');
      const factoryLink = links[0];
      const classes = factoryLink.getAttribute('class');
      expect(classes).toContain('hover:text-black');
    });

    it('should render login icon when user is not authenticated', () => {
      fixture.detectChanges();

      const links = fixture.nativeElement.querySelectorAll('a');
      const accountLink: HTMLAnchorElement = links[links.length - 1];
      const icon: HTMLImageElement | null = accountLink.querySelector('img');

      expect(icon).not.toBeNull();
      expect(icon?.getAttribute('src')).toContain('assets/svgs/minfactory/login.svg');
    });

    it('should render account icon when user is authenticated', () => {
      AUTHENTICATION_SERVICE_MOCK.setCurrentUser({
        getIdToken: jasmine.createSpy('getIdToken').and.resolveTo('firebase-token'),
      } as unknown as FirebaseUser);
      fixture.detectChanges();

      const links = fixture.nativeElement.querySelectorAll('a');
      const accountLink: HTMLAnchorElement = links[links.length - 1];
      const icon: HTMLImageElement | null = accountLink.querySelector('img');

      expect(icon).not.toBeNull();
      expect(icon?.getAttribute('src')).toContain('assets/svgs/minfactory/account.svg');
    });
  });
});
