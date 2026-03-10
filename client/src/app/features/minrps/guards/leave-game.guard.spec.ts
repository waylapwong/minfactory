import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { CanLeaveGame, leaveGameGuard } from './leave-game.guard';

describe('leaveGameGuard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()],
    });
  });

  it('should call canDeactivate on the component', async () => {
    const mockComponent: CanLeaveGame = {
      canDeactivate: jasmine.createSpy('canDeactivate').and.returnValue(Promise.resolve(true)),
    };

    const result = leaveGameGuard(mockComponent as any, null as any, null as any, null as any);

    expect(mockComponent.canDeactivate).toHaveBeenCalled();
    await expectAsync(result as Promise<boolean>).toBeResolvedTo(true);
  });

  it('should return false when canDeactivate resolves to false', async () => {
    const mockComponent: CanLeaveGame = {
      canDeactivate: jasmine.createSpy('canDeactivate').and.returnValue(Promise.resolve(false)),
    };

    const result = leaveGameGuard(mockComponent as any, null as any, null as any, null as any);

    await expectAsync(result as Promise<boolean>).toBeResolvedTo(false);
  });
});
