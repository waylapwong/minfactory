import { LoggerService } from './logger.service';

describe('LoggerService', () => {
  let service: LoggerService;

  beforeEach(() => {
    service = new LoggerService('TestContext');
    spyOn(console, 'debug');
    spyOn(console, 'log');
    spyOn(console, 'warn');
    spyOn(console, 'error');
  });

  it('should call console.debug with the correct format', () => {
    service.debug('test message');

    expect(console.debug).toHaveBeenCalledOnceWith('[DEBUG]   [TestContext] test message');
  });

  it('should call console.log with the correct format', () => {
    service.log('test message');

    expect(console.log).toHaveBeenCalledOnceWith('[LOG]     [TestContext] test message');
  });

  it('should call console.warn with the correct format', () => {
    service.warn('test message');

    expect(console.warn).toHaveBeenCalledOnceWith('[WARN]    [TestContext] test message');
  });

  it('should call console.error with the correct format', () => {
    service.error('test message');

    expect(console.error).toHaveBeenCalledOnceWith('[ERROR]   [TestContext] test message');
  });

  it('should include the context name in every log output', () => {
    const contextService = new LoggerService('MyServiceName');

    contextService.log('some message');

    expect(console.log).toHaveBeenCalledWith(jasmine.stringContaining('[MyServiceName]'));
  });
});
