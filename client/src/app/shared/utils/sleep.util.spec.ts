import { sleep } from './sleep.util';

describe('sleep()', () => {
  it('should resolve after the given milliseconds ', async () => {
    const start = Date.now();
    const delay = 10;

    await sleep(delay);

    const elapsed = Date.now() - start;
    expect(elapsed).toBeGreaterThanOrEqual(delay);
  });
});
