/**
 * 统一的日志工具
 * 提供统一的日志接口，便于后续集成日志服务
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogOptions {
  level: LogLevel;
  message: string;
  error?: Error | unknown;
  context?: Record<string, unknown>;
}

/**
 * 日志记录器
 */
class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';

  private formatMessage(level: LogLevel, message: string, error?: Error | unknown, context?: Record<string, unknown>): string {
    const timestamp = new Date().toISOString();
    const contextStr = context ? ` ${JSON.stringify(context)}` : '';
    const errorStr = error instanceof Error ? `\nError: ${error.message}\nStack: ${error.stack}` : error ? `\nError: ${JSON.stringify(error)}` : '';
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${contextStr}${errorStr}`;
  }

  private log(options: LogOptions): void {
    const { level, message, error, context } = options;

    // 生产环境只记录 warn 和 error
    if (!this.isDevelopment && (level === 'debug' || level === 'info')) {
      return;
    }

    const formattedMessage = this.formatMessage(level, message, error, context);

    switch (level) {
      case 'debug':
        if (this.isDevelopment) {
          // eslint-disable-next-line no-console
          console.debug(formattedMessage);
        }
        break;
      case 'info':
        // eslint-disable-next-line no-console
        console.info(formattedMessage);
        break;
      case 'warn':
        // eslint-disable-next-line no-console
        console.warn(formattedMessage);
        break;
      case 'error':
        // eslint-disable-next-line no-console
        console.error(formattedMessage);
        // 生产环境可以在这里集成错误追踪服务（如 Sentry）
        if (!this.isDevelopment && error) {
          // TODO: 集成错误追踪服务
          // Sentry.captureException(error, { extra: context });
        }
        break;
    }
  }

  debug(message: string, context?: Record<string, unknown>): void {
    this.log({ level: 'debug', message, context });
  }

  info(message: string, context?: Record<string, unknown>): void {
    this.log({ level: 'info', message, context });
  }

  warn(message: string, error?: Error | unknown, context?: Record<string, unknown>): void {
    this.log({ level: 'warn', message, error, context });
  }

  error(message: string, error?: Error | unknown, context?: Record<string, unknown>): void {
    this.log({ level: 'error', message, error, context });
  }
}

// 导出单例
export const logger = new Logger();

// 导出类型
export type { LogLevel, LogOptions };
