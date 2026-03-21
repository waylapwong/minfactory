import { MinFactoryUser } from '../models/domains/minfactory-user';
import { MinFactoryProfileViewModel } from '../models/viewmodels/minfactory-profile.viewmodel';
import { MinFactoryViewmodelMapper } from './minfactory-viewmodel.mapper';

describe('MinFactoryViewmodelMapper', () => {
  describe('domainToProfileViewModel()', () => {
    it('should map domain to profile viewmodel', () => {
      const domain = new MinFactoryUser({
        createdAt: new Date('2026-03-21T16:30:00.000Z'),
        email: 'user@example.com',
      });

      const viewModel: MinFactoryProfileViewModel = MinFactoryViewmodelMapper.domainToProfileViewModel(domain);

      const expectedCreatedAt = new Intl.DateTimeFormat('de-DE', {
        dateStyle: 'medium',
        timeStyle: 'short',
      }).format(domain.createdAt);

      expect(viewModel.email).toBe('user@example.com');
      expect(viewModel.createdAt).toBe(expectedCreatedAt);
    });

    it('should create a new viewmodel object for each mapping', () => {
      const domain = new MinFactoryUser({
        createdAt: new Date('2026-03-21T08:15:00.000Z'),
        email: 'factory@example.com',
      });

      const first: MinFactoryProfileViewModel = MinFactoryViewmodelMapper.domainToProfileViewModel(domain);
      const second: MinFactoryProfileViewModel = MinFactoryViewmodelMapper.domainToProfileViewModel(domain);

      expect(first).not.toBe(second);
      expect(first.email).toBe('factory@example.com');
      expect(second.email).toBe('factory@example.com');
    });
  });
});
