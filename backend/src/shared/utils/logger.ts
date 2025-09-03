import config from '@config/index';

enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
}

const log = (level: LogLevel, message: string, data?: object) => {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    level,
    message,
    ...data,
  };

  if (config.NODE_ENV === 'development') {
    const colorMap = {
      [LogLevel.DEBUG]: '\x1b[34m',
      [LogLevel.INFO]: '\x1b[32m',
      [LogLevel.WARN]: '\x1b[33m',
      [LogLevel.ERROR]: '\x1b[31m',
    };
    console.log(`${colorMap[level]}[${timestamp}] [${level}] ${message}\x1b[0m`, data || '');
  } else {
    console.log(JSON.stringify(logEntry));
  }
};

export const logger = {
  debug: (message: string, data?: object) => log(LogLevel.DEBUG, message, data),
  info: (message: string, data?: object) => log(LogLevel.INFO, message, data),
  warn: (message: string, data?: object) => log(LogLevel.WARN, message, data),
  error: (message: string, data?: object) => log(LogLevel.ERROR, message, data),
};
