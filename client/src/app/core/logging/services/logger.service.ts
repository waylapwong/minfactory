export class LoggerService {
  constructor(private readonly context: string) {}

  public debug(message: string): void {
    console.debug(`[DEBUG] [${this.context}] ${message}`);
  }

  public log(message: string): void {
    console.log(`[LOG]   [${this.context}] ${message}`);
  }

  public warn(message: string): void {
    console.warn(`[WARN]  [${this.context}] ${message}`);
  }

  public error(message: string): void {
    console.error(`[ERROR] [${this.context}] ${message}`);
  }
}
