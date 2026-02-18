import { MinRpsOverviewViewModel } from './minrps-overview.viewmodel';

describe('MinRpsOverviewViewModel', () => {
  it('should create instance with properties', () => {
    const viewModel = new MinRpsOverviewViewModel();
    viewModel.id = 'game-123';
    viewModel.name = 'Test Game';
    viewModel.createdAt = new Date('2024-01-01');
    viewModel.playerCount = 2;
    viewModel.observerCount = 5;

    expect(viewModel.id).toBe('game-123');
    expect(viewModel.name).toBe('Test Game');
    expect(viewModel.createdAt).toEqual(new Date('2024-01-01'));
    expect(viewModel.playerCount).toBe(2);
    expect(viewModel.observerCount).toBe(5);
  });
});
