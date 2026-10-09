import { MinFactoryRole } from '../../../shared/enums/minfactory-role.enum';
import { MinFactoryUser } from '../../minfactory/models/domains/minfactory-user';
import { MinPokerGamePolicy } from './minpoker-game.policy';

describe('MinPokerGamePolicy', () => {
  const policy = new MinPokerGamePolicy();

  it('allows the game creator to delete their game', () => {
    const creator = Object.assign(new MinFactoryUser(), { id: 'creator-1', role: MinFactoryRole.User });

    expect(policy.delete(creator, 'creator-1')).toBe(true);
  });

  it('allows an Admin to delete any game', () => {
    const admin = Object.assign(new MinFactoryUser(), { id: 'admin-1', role: MinFactoryRole.Admin });

    expect(policy.delete(admin, 'creator-1')).toBe(true);
  });

  it('denies a non-owner User from deleting the game', () => {
    const user = Object.assign(new MinFactoryUser(), { id: 'user-1', role: MinFactoryRole.User });

    expect(policy.delete(user, 'creator-1')).toBe(false);
  });

  it('denies unauthenticated users', () => {
    expect(policy.delete(null, 'creator-1')).toBe(false);
  });
});
