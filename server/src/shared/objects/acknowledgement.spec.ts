import { Acknowledgement } from './acknowledgement';

describe('Acknowledgement', () => {
  it('should create instance with isSuccess true', () => {
    const ack = new Acknowledgement();

    expect(ack.isSuccess).toBe(true);
  });

  it('should have default message OK', () => {
    const ack = new Acknowledgement();

    expect(ack.message).toBe('OK');
  });

  it('should allow setting custom message', () => {
    const ack = new Acknowledgement();
    ack.message = 'Custom message';

    expect(ack.message).toBe('Custom message');
  });
});
