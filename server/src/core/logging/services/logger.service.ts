import { Logger } from '@nestjs/common';

export class LoggerService extends Logger {
  constructor(context: string) {
    super(context, { timestamp: true });
  }

  public debug(message: string, requestId: string): void {
    super.debug(this.withRequestId(message, requestId));
  }

  public error(message: string, requestId: string): void {
    super.error(this.withRequestId(message, requestId));
  }

  public log(message: string, requestId: string): void {
    super.log(this.withRequestId(message, requestId));
  }

  public warn(message: string, requestId: string): void {
    super.warn(this.withRequestId(message, requestId));
  }

  private withRequestId(message: string, requestId: string): string {
    return `[${requestId}] ${message}`;
  }
}
