import { getConfig } from '../config/env.js';

type LogLevel = 'error' | 'warn' | 'info' | 'debug';

const colors = {
  error: '\x1b[31m',
  warn: '\x1b[33m',
  info: '\x1b[36m',
  debug: '\x1b[90m',
  reset: '\x1b[0m',
};

const levels: Record<LogLevel, number> = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
};

class Logger {
  private level: LogLevel;

  constructor() {
    const config = getConfig();
    this.level = config.LOG_LEVEL as LogLevel;
  }

  private shouldLog(level: LogLevel): boolean {
    return levels[level] <= levels[this.level];
  }

  private log(level: LogLevel, message: string, meta?: any) {
    if (!this.shouldLog(level)) return;

    const timestamp = new Date().toISOString();
    const color = colors[level];
    const reset = colors.reset;

    console.log(
      `${color}[${timestamp}] [${level.toUpperCase()}]${reset} ${message}`,
      meta ? JSON.stringify(meta, null, 2) : ''
    );
  }

  error(message: string, meta?: any) {
    this.log('error', message, meta);
  }

  warn(message: string, meta?: any) {
    this.log('warn', message, meta);
  }

  info(message: string, meta?: any) {
    this.log('info', message, meta);
  }

  debug(message: string, meta?: any) {
    this.log('debug', message, meta);
  }
}

export const logger = new Logger();
