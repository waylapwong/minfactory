import { Logger } from '@nestjs/common';
import { LoggerService } from './logger.service';

describe('LoggerService', () => {
  let logger: LoggerService;

  beforeEach(() => {
    logger = new LoggerService(LoggerService.name);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('log()', () => {
    it('should log the message with request id', () => {
      const spy = jest.spyOn(Logger.prototype, 'log').mockImplementation();

      logger.log('Incoming request GET /test', 'request-123');

      expect(spy).toHaveBeenCalledWith('[request-123] Incoming request GET /test');
    });
  });

  describe('warn()', () => {
    it('should warn the message with request id', () => {
      const spy = jest.spyOn(Logger.prototype, 'warn').mockImplementation();

      logger.warn('Potential issue', 'request-123');

      expect(spy).toHaveBeenCalledWith('[request-123] Potential issue');
    });
  });

  describe('debug()', () => {
    it('should debug the message with request id', () => {
      const spy = jest.spyOn(Logger.prototype, 'debug').mockImplementation();

      logger.debug('Debug details', 'request-123');

      expect(spy).toHaveBeenCalledWith('[request-123] Debug details');
    });
  });

  describe('error()', () => {
    it('should error the message with request id', () => {
      const spy = jest.spyOn(Logger.prototype, 'error').mockImplementation();

      logger.error('Failed request', 'request-123');

      expect(spy).toHaveBeenCalledWith('[request-123] Failed request');
    });
  });
});
