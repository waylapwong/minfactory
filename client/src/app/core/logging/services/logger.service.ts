export class LoggerService {
  constructor(private readonly context: string) {}

  public debug(message: string): void {
    if (this.isTestEnvironment()) {
      return;
    }

    console.debug(`[DEBUG]   [${this.context}] ${message}`);
  }

  public error(message: string): void {
    console.error(`[ERROR]   [${this.context}] ${message}`);
  }

  public log(message: string): void {
    console.log(`[LOG]     [${this.context}] ${message}`);
  }

  public warn(message: string): void {
    console.warn(`[WARN]    [${this.context}] ${message}`);
  }

  private isTestEnvironment(): boolean {
    return typeof window !== 'undefined' && '__karma__' in window;
  }
}
