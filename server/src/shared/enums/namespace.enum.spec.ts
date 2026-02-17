import { Namespace } from './namespace.enum';

describe('Namespace', () => {
  it('should have MinRps namespace defined', () => {
    expect(Namespace.MinRps).toBe('minrps');
  });
});
