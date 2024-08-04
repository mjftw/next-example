import { type ConfigurationService } from "./configuration";

export interface LogMeta {
  [key: string]: unknown;
}

export type LogLevel = "debug" | "info" | "warn" | "error";

export interface LoggerService {
  debug: (message: string, meta?: LogMeta) => void;
  info: (message: string, meta?: LogMeta) => void;
  warn: (message: string, meta?: LogMeta) => void;
  error: (message: string, meta?: LogMeta, error?: Error) => void;
}

export const createLoggerService = (configService: ConfigurationService): LoggerService => {
 const logLevel: LogLevel = configService.getEnv("LOG_LEVEL");
 
  const shouldLog = (level: LogLevel): boolean => {
    const levels: LogLevel[] = ["debug", "info", "warn", "error"];
    return levels.indexOf(level) >= levels.indexOf(logLevel);
  };

  const log = (level: LogLevel, message: string, meta?: LogMeta, error?: Error) => {
    if (shouldLog(level)) {
      const logObject: Record<string, unknown> = { level, message, ...meta };
      if (error) {
        logObject.error = {
          name: error.name,
          message: error.message,
          stack: error.stack,
        };
      }
      console[level](JSON.stringify(logObject));
    }
  };

  return {
    debug: (message: string, meta?: LogMeta) => log("debug", message, meta),
    info: (message: string, meta?: LogMeta) => log("info", message, meta),
    warn: (message: string, meta?: LogMeta) => log("warn", message, meta),
    error: (message: string, meta?: LogMeta, error?: Error) => log("error", message, meta, error),
  };
};